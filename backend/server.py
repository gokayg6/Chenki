from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import base64
import iyzipay
import json
import hmac
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days

# Create upload directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== Models ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int = 0

class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem]
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem]
    total_amount: float
    status: str  # pending, paid, processing, shipped, delivered, cancelled
    payment_id: Optional[str] = None
    shipping_address: dict
    billing_address: dict
    buyer_info: dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: dict
    billing_address: dict
    buyer_info: dict

class PaymentRequest(BaseModel):
    order_id: str
    card_number: str
    card_holder_name: str
    expire_month: str
    expire_year: str
    cvc: str

# ==================== Auth Functions ====================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== Auth Routes ====================

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_obj = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password)
    )
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_access_token(data={"sub": user_obj.id})
    return {"token": token, "user": {"id": user_obj.id, "email": user_obj.email, "name": user_obj.name, "is_admin": user_obj.is_admin}}

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user or not verify_password(user_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(data={"sub": user['id']})
    return {"token": token, "user": {"id": user['id'], "email": user['email'], "name": user['name'], "is_admin": user.get('is_admin', False)}}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user['id'], "email": current_user['email'], "name": current_user['name'], "is_admin": current_user.get('is_admin', False)}

# ==================== Product Routes ====================

@api_router.get("/products")
async def get_products(category: Optional[str] = None, search: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] = None):
    query = {}
    if category:
        query['category'] = category
    if search:
        query['name'] = {"$regex": search, "$options": "i"}
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products")
async def create_product(product_data: ProductCreate, current_user: dict = Depends(get_admin_user)):
    product_obj = Product(**product_data.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product_obj

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product_data: ProductCreate, current_user: dict = Depends(get_admin_user)):
    result = await db.products.update_one({"id": product_id}, {"$set": product_data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated successfully"}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_admin_user)):
    file_ext = file.filename.split('.')[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / file_name
    
    contents = await file.read()
    with open(file_path, 'wb') as f:
        f.write(contents)
    
    return {"image_url": f"/uploads/{file_name}"}

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct("category")
    return categories

# ==================== Cart Routes ====================

@api_router.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not cart:
        return {"items": []}
    return cart

@api_router.post("/cart")
async def add_to_cart(item: CartItem, current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user['id']})
    
    if not cart:
        cart_obj = Cart(user_id=current_user['id'], items=[item])
        doc = cart_obj.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.carts.insert_one(doc)
    else:
        items = cart.get('items', [])
        existing_item = next((i for i in items if i['product_id'] == item.product_id), None)
        if existing_item:
            existing_item['quantity'] += item.quantity
        else:
            items.append(item.model_dump())
        
        await db.carts.update_one(
            {"user_id": current_user['id']},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"message": "Item added to cart"}

@api_router.put("/cart/{product_id}")
async def update_cart_item(product_id: str, quantity: int, current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user['id']})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get('items', [])
    item = next((i for i in items if i['product_id'] == product_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    if quantity <= 0:
        items = [i for i in items if i['product_id'] != product_id]
    else:
        item['quantity'] = quantity
    
    await db.carts.update_one(
        {"user_id": current_user['id']},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    await db.carts.delete_one({"user_id": current_user['id']})
    return {"message": "Cart cleared"}

# ==================== Order Routes ====================

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    total = sum(item.price * item.quantity for item in order_data.items)
    
    order_obj = Order(
        user_id=current_user['id'],
        items=[item.model_dump() for item in order_data.items],
        total_amount=total,
        status="pending",
        shipping_address=order_data.shipping_address,
        billing_address=order_data.billing_address,
        buyer_info=order_data.buyer_info
    )
    
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    
    return order_obj

@api_router.get("/orders")
async def get_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user['id']}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.get("/admin/orders")
async def get_all_orders(current_user: dict = Depends(get_admin_user)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}")
async def update_order_status(order_id: str, status: str, current_user: dict = Depends(get_admin_user)):
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}

# ==================== Payment Routes ====================

@api_router.post("/payment/process")
async def process_payment(payment_req: PaymentRequest, request: Request, current_user: dict = Depends(get_current_user)):
    try:
        # Get order
        order = await db.orders.find_one({"id": payment_req.order_id, "user_id": current_user['id']}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get iyzico settings
        api_key = os.environ.get('IYZICO_API_KEY', '')
        secret_key = os.environ.get('IYZICO_SECRET_KEY', '')
        base_url = os.environ.get('IYZICO_BASE_URL', 'https://sandbox-api.iyzipay.com')
        
        options = {
            'api_key': api_key,
            'secret_key': secret_key,
            'base_url': base_url
        }
        
        # Build basket items
        basket_items = []
        for item in order['items']:
            basket_items.append({
                'id': item['product_id'],
                'name': f"Product {item['product_id']}",
                'category1': 'General',
                'itemType': 'PHYSICAL',
                'price': str(item['price'] * item['quantity'])
            })
        
        # Build payment request
        payment_request = {
            'locale': 'en',
            'conversationId': order['id'],
            'price': str(order['total_amount']),
            'paidPrice': str(order['total_amount']),
            'currency': 'TRY',
            'installment': 1,
            'basketId': order['id'],
            'paymentChannel': 'WEB',
            'paymentGroup': 'PRODUCT',
            'cardNumber': payment_req.card_number.replace(' ', ''),
            'cardHolderName': payment_req.card_holder_name,
            'expireMonth': payment_req.expire_month,
            'expireYear': payment_req.expire_year,
            'cvc': payment_req.cvc,
            'buyer': {
                'id': current_user['id'],
                'name': order['buyer_info'].get('name', 'Customer'),
                'surname': order['buyer_info'].get('surname', 'Customer'),
                'email': current_user['email'],
                'identityNumber': order['buyer_info'].get('identity_number', '11111111111'),
                'registrationAddress': order['billing_address'].get('address', 'Address'),
                'ip': request.client.host,
                'city': order['billing_address'].get('city', 'City'),
                'country': order['billing_address'].get('country', 'Turkey'),
                'zipCode': order['billing_address'].get('zip_code', '34000'),
            },
            'shippingAddress': {
                'address': order['shipping_address'].get('address', 'Address'),
                'zipCode': order['shipping_address'].get('zip_code', '34000'),
                'contactName': order['shipping_address'].get('contact_name', 'Customer'),
                'city': order['shipping_address'].get('city', 'City'),
                'country': order['shipping_address'].get('country', 'Turkey'),
            },
            'billingAddress': {
                'address': order['billing_address'].get('address', 'Address'),
                'zipCode': order['billing_address'].get('zip_code', '34000'),
                'contactName': order['billing_address'].get('contact_name', 'Customer'),
                'city': order['billing_address'].get('city', 'City'),
                'country': order['billing_address'].get('country', 'Turkey'),
            },
            'basketItems': basket_items
        }
        
        # Process payment
        payment = iyzipay.Payment().create(payment_request, options)
        
        if payment.get('status') == 'success':
            await db.orders.update_one(
                {"id": order['id']},
                {"$set": {"status": "paid", "payment_id": payment.get('paymentId')}}
            )
            await db.carts.delete_one({"user_id": current_user['id']})
            
            return {
                "success": True,
                "payment_id": payment.get('paymentId'),
                "message": "Payment processed successfully"
            }
        else:
            return {
                "success": False,
                "message": payment.get('errorMessage', 'Payment failed'),
                "error_code": payment.get('errorCode')
            }
    
    except Exception as e:
        logger.error(f"Payment processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment processing failed")

# ==================== Main App ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()