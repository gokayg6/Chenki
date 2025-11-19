"""
E-Commerce Backend API
FastAPI-based REST API for e-commerce platform
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional
import os
import logging
import uuid
import json
import asyncio
from threading import Lock

from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import iyzipay

# ==================== Configuration ====================

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Vercel environment detection
IS_VERCEL = os.environ.get('VERCEL') == '1'

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Using in-memory database (no MongoDB needed)

# Security Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Upload Directory - Vercel için /tmp kullan
if IS_VERCEL:
    UPLOAD_DIR = Path('/tmp/uploads')
else:
    UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

# Data Directory - Vercel için /tmp kullan
if IS_VERCEL:
    DATA_DIR = Path('/tmp/data')
else:
    DATA_DIR = ROOT_DIR / 'data'
DATA_DIR.mkdir(exist_ok=True, parents=True)

# JSON Database Files
USERS_FILE = DATA_DIR / 'users.json'
PRODUCTS_FILE = DATA_DIR / 'products.json'
CARTS_FILE = DATA_DIR / 'carts.json'
ORDERS_FILE = DATA_DIR / 'orders.json'
VARIANTS_FILE = DATA_DIR / 'variants.json'
SHIPPING_FILE = DATA_DIR / 'shipping.json'
RETURNS_FILE = DATA_DIR / 'returns.json'

# Thread lock for file operations
file_lock = Lock()

# ==================== Persistent JSON Database ====================

class PersistentDB:
    """JSON file-based persistent database"""
    def __init__(self):
        self.users = {}
        self.products = []
        self.carts = {}
        self.orders = []
        self.variants = []
        self.shipping = []
        self.returns = []
        self._load_all()
        logger.info("Persistent database initialized")
    
    def _load_json(self, filepath: Path, default):
        """Load data from JSON file"""
        try:
            if filepath.exists():
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    logger.info(f"Loaded {len(data) if isinstance(data, (list, dict)) else 0} items from {filepath.name}")
                    return data
        except Exception as e:
            logger.warning(f"Error loading {filepath.name}: {e}, using in-memory default")
        return default
    
    def _save_json(self, filepath: Path, data):
        """Save data to JSON file"""
        try:
            with file_lock:
                # Ensure directory exists
                filepath.parent.mkdir(parents=True, exist_ok=True)
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False, default=str)
            logger.debug(f"Saved {len(data) if isinstance(data, (list, dict)) else 0} items to {filepath.name}")
        except Exception as e:
            logger.warning(f"Error saving {filepath.name}: {e}, data will be in-memory only")
            # Vercel'de dosya yazma başarısız olabilir, bu normal
    
    def _load_all(self):
        """Load all data from JSON files"""
        self.users = self._load_json(USERS_FILE, {})
        self.products = self._load_json(PRODUCTS_FILE, [])
        self.carts = self._load_json(CARTS_FILE, {})
        self.orders = self._load_json(ORDERS_FILE, [])
        self.variants = self._load_json(VARIANTS_FILE, [])
        self.shipping = self._load_json(SHIPPING_FILE, [])
        self.returns = self._load_json(RETURNS_FILE, [])
    
    def save_users(self):
        """Save users to file"""
        self._save_json(USERS_FILE, self.users)
    
    def save_products(self):
        """Save products to file"""
        self._save_json(PRODUCTS_FILE, self.products)
    
    def save_carts(self):
        """Save carts to file"""
        self._save_json(CARTS_FILE, self.carts)
    
    def save_orders(self):
        """Save orders to file"""
        self._save_json(ORDERS_FILE, self.orders)
    
    def save_variants(self):
        """Save variants to file"""
        self._save_json(VARIANTS_FILE, self.variants)
    
    def save_shipping(self):
        """Save shipping info to file"""
        self._save_json(SHIPPING_FILE, self.shipping)
    
    def save_returns(self):
        """Save returns to file"""
        self._save_json(RETURNS_FILE, self.returns)

    def save_all(self):
        """Save all data to files"""
        self.save_users()
        self.save_products()
        self.save_carts()
        self.save_orders()
        self.save_variants()
        self.save_shipping()
        self.save_returns()

database = PersistentDB()

async def connect_to_mongo():
    """Initialize persistent database"""
    logger.info("Using persistent JSON database")
    
    # Create default admin user if it doesn't exist
    admin_exists = any(u.get('email') == 'admin@chenki.com' for u in database.users.values())
    if not admin_exists:
        admin_id = str(uuid.uuid4())
        database.users[admin_id] = {
            "id": admin_id,
            "email": "admin@chenki.com",
            "name": "Admin",
            "password_hash": get_password_hash("admin123"),
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        database.save_users()
        logger.info("Default admin user created: admin@chenki.com / admin123")
    else:
        logger.info("Admin user already exists")
    
    # Add sample products if database is empty
    if len(database.products) == 0:
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "Sample Product 1",
                "description": "This is a sample product",
                "price": 99.99,
                "category": "Electronics",
                "image_url": "/uploads/sample1.jpg",
                "stock": 10,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Sample Product 2",
                "description": "Another sample product",
                "price": 149.99,
                "category": "Clothing",
                "image_url": "/uploads/sample2.jpg",
                "stock": 5,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        database.products = sample_products
        database.save_products()
        logger.info(f"Added {len(sample_products)} sample products")
    else:
        logger.info(f"Loaded {len(database.products)} existing products")

async def close_mongo_connection():
    """Save all data before shutdown"""
    logger.info("Saving all data before shutdown...")
    database.save_all()
    logger.info("All data saved successfully")

# ==================== Pydantic Models ====================

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

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_admin: bool

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

# ==================== Product Variants ====================

class ProductVariant(BaseModel):
    """Product variant (size, color, etc.)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    size: Optional[str] = None
    color: Optional[str] = None
    sku: Optional[str] = None
    stock: int = 0
    price_adjustment: float = 0.0  # Price difference from base price
    image_url: Optional[str] = None

class ProductVariantCreate(BaseModel):
    product_id: str
    size: Optional[str] = None
    color: Optional[str] = None
    sku: Optional[str] = None
    stock: int = 0
    price_adjustment: float = 0.0
    image_url: Optional[str] = None

# ==================== Shipping & Tracking ====================

class ShippingInfo(BaseModel):
    """Shipping information"""
    order_id: str
    carrier: str  # MNG, Aras, Yurtiçi, Sürat, etc.
    tracking_number: str
    status: str  # pending, shipped, in_transit, delivered
    estimated_delivery: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class ShippingCreate(BaseModel):
    order_id: str
    carrier: str
    tracking_number: str

# ==================== Returns & Refunds ====================

class ReturnRequest(BaseModel):
    """Return/refund request"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    user_id: str
    items: List[dict]  # Items to return
    reason: str
    status: str = "pending"  # pending, approved, rejected, processed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processed_at: Optional[datetime] = None

class ReturnCreate(BaseModel):
    order_id: str
    items: List[dict]
    reason: str

# ==================== Auth Utilities ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    # Find user in in-memory database
    user = None
    for uid, u in database.users.items():
        if u["id"] == user_id:
            user = u.copy()
            break
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

async def get_admin_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Get current user and verify admin access"""
    if not current_user.get('is_admin'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# ==================== API Routes ====================

api_router = APIRouter(prefix="/api")

# Auth Routes
@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if email already exists
    for user in database.users.values():
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    user_obj = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password)
    )
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    database.users[user_obj.id] = doc
    database.save_users()  # Save to file
    
    token = create_access_token(data={"sub": user_obj.id})
    return {
        "token": token,
        "user": {
            "id": user_obj.id,
            "email": user_obj.email,
            "name": user_obj.name,
            "is_admin": user_obj.is_admin
        }
    }

@api_router.post("/auth/login", response_model=dict)
async def login(user_data: UserLogin):
    """Login user"""
    # Find user by email
    user = None
    for u in database.users.values():
        if u["email"] == user_data.email:
            user = u.copy()
            break
    
    if not user or not verify_password(user_data.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token(data={"sub": user['id']})
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "is_admin": user.get('is_admin', False)
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        name=current_user['name'],
        is_admin=current_user.get('is_admin', False)
    )

# Product Routes
@api_router.get("/products", response_model=List[dict])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    """Get products with optional filters"""
    products = database.products.copy()
    
    # Apply filters
    if category:
        products = [p for p in products if p.get('category') == category]
    if search:
        search_lower = search.lower()
        products = [p for p in products if search_lower in p.get('name', '').lower()]
    if min_price is not None:
        products = [p for p in products if p.get('price', 0) >= min_price]
    if max_price is not None:
        products = [p for p in products if p.get('price', float('inf')) <= max_price]
    
    return products

@api_router.get("/products/{product_id}", response_model=dict)
async def get_product(product_id: str):
    """Get a single product by ID"""
    product = next((p for p in database.products if p.get('id') == product_id), None)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@api_router.post("/products", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_admin_user)
):
    """Create a new product (Admin only)"""
    product_obj = Product(**product_data.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    database.products.append(doc)
    database.save_products()  # Save to file
    return product_obj

@api_router.put("/products/{product_id}", response_model=dict)
async def update_product(
    product_id: str,
    product_data: ProductCreate,
    current_user: dict = Depends(get_admin_user)
):
    """Update a product (Admin only)"""
    product = next((p for p in database.products if p.get('id') == product_id), None)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    product.update(product_data.model_dump())
    database.save_products()  # Save to file
    return {"message": "Product updated successfully"}

@api_router.delete("/products/{product_id}", response_model=dict)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_admin_user)
):
    """Delete a product (Admin only)"""
    initial_len = len(database.products)
    database.products = [p for p in database.products if p.get('id') != product_id]
    if len(database.products) == initial_len:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    database.save_products()  # Save to file
    return {"message": "Product deleted successfully"}

@api_router.post("/upload", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_admin_user)
):
    """Upload an image (Admin only)"""
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / file_name
    
    contents = await file.read()
    with open(file_path, 'wb') as f:
        f.write(contents)
    
    return {"image_url": f"/uploads/{file_name}"}

@api_router.get("/categories", response_model=List[str])
async def get_categories():
    """Get all product categories"""
    categories = list(set(p.get('category', '') for p in database.products if p.get('category')))
    return categories

# Cart Routes
@api_router.get("/cart", response_model=dict)
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Get user's cart"""
    cart = database.carts.get(current_user['id'])
    if not cart:
        return {"items": []}
    return cart

@api_router.post("/cart", response_model=dict)
async def add_to_cart(
    item: CartItem,
    current_user: dict = Depends(get_current_user)
):
    """Add item to cart"""
    cart = database.carts.get(current_user['id'])
    
    if not cart:
        cart_obj = Cart(user_id=current_user['id'], items=[item])
        doc = cart_obj.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        database.carts[current_user['id']] = doc
    else:
        items = cart.get('items', [])
        existing_item = next(
            (i for i in items if i['product_id'] == item.product_id),
            None
        )
        if existing_item:
            existing_item['quantity'] += item.quantity
        else:
            items.append(item.model_dump())
        
        cart['items'] = items
        cart['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    database.save_carts()  # Save to file
    return {"message": "Item added to cart"}

@api_router.put("/cart/{product_id}", response_model=dict)
async def update_cart_item(
    product_id: str,
    quantity: int,
    current_user: dict = Depends(get_current_user)
):
    """Update cart item quantity"""
    cart = database.carts.get(current_user['id'])
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    items = cart.get('items', [])
    item = next((i for i in items if i['product_id'] == product_id), None)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    if quantity <= 0:
        items = [i for i in items if i['product_id'] != product_id]
    else:
        item['quantity'] = quantity
    
    cart['items'] = items
    cart['updated_at'] = datetime.now(timezone.utc).isoformat()
    database.save_carts()  # Save to file
    
    return {"message": "Cart updated"}

@api_router.delete("/cart", response_model=dict)
async def clear_cart(current_user: dict = Depends(get_current_user)):
    """Clear user's cart"""
    if current_user['id'] in database.carts:
        del database.carts[current_user['id']]
        database.save_carts()  # Save to file
    return {"message": "Cart cleared"}

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new order"""
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
    database.orders.append(doc)
    database.save_orders()  # Save to file
    
    return order_obj

@api_router.get("/orders", response_model=List[dict])
async def get_orders(current_user: dict = Depends(get_current_user)):
    """Get user's orders"""
    orders = [o for o in database.orders if o.get('user_id') == current_user['id']]
    orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return orders[:100]

@api_router.get("/orders/{order_id}", response_model=dict)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a single order by ID"""
    order = next((o for o in database.orders if o.get('id') == order_id and o.get('user_id') == current_user['id']), None)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order

# Admin Routes
@api_router.get("/admin/orders", response_model=List[dict])
async def get_all_orders(current_user: dict = Depends(get_admin_user)):
    """Get all orders (Admin only)"""
    orders = database.orders.copy()
    orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return orders[:1000]

@api_router.put("/admin/orders/{order_id}", response_model=dict)
async def update_order_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_admin_user)
):
    """Update order status (Admin only)"""
    order = next((o for o in database.orders if o.get('id') == order_id), None)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    order['status'] = status
    database.save_orders()  # Save to file
    return {"message": "Order status updated"}

# Payment Routes
@api_router.post("/payment/process", response_model=dict)
async def process_payment(
    payment_req: PaymentRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Process payment via iyzico"""
    try:
        # Get order
        order = next((o for o in database.orders if o.get('id') == payment_req.order_id and o.get('user_id') == current_user['id']), None)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
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
            order['status'] = "paid"
            order['payment_id'] = payment.get('paymentId')
            database.save_orders()  # Save to file
            if current_user['id'] in database.carts:
                del database.carts[current_user['id']]
                database.save_carts()  # Save to file
            
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
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment processing error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment processing failed"
        )

# ==================== Product Variants Routes ====================

@api_router.get("/products/{product_id}/variants", response_model=List[dict])
async def get_product_variants(product_id: str):
    """Get all variants for a product"""
    variants = [v for v in database.variants if v.get('product_id') == product_id]
    return variants

@api_router.post("/products/{product_id}/variants", response_model=dict)
async def create_product_variant(
    product_id: str,
    variant_data: ProductVariantCreate,
    current_user: dict = Depends(get_admin_user)
):
    """Create a product variant (Admin only)"""
    # Verify product exists
    product = next((p for p in database.products if p.get('id') == product_id), None)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    variant_obj = ProductVariant(**variant_data.model_dump(), product_id=product_id)
    doc = variant_obj.model_dump()
    database.variants.append(doc)
    database.save_variants()
    return doc

@api_router.put("/variants/{variant_id}", response_model=dict)
async def update_product_variant(
    variant_id: str,
    variant_data: ProductVariantCreate,
    current_user: dict = Depends(get_admin_user)
):
    """Update a product variant (Admin only)"""
    variant = next((v for v in database.variants if v.get('id') == variant_id), None)
    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found"
        )
    variant.update(variant_data.model_dump())
    database.save_variants()
    return variant

@api_router.delete("/variants/{variant_id}", response_model=dict)
async def delete_product_variant(
    variant_id: str,
    current_user: dict = Depends(get_admin_user)
):
    """Delete a product variant (Admin only)"""
    initial_len = len(database.variants)
    database.variants = [v for v in database.variants if v.get('id') != variant_id]
    if len(database.variants) == initial_len:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found"
        )
    database.save_variants()
    return {"message": "Variant deleted successfully"}

# ==================== Shipping & Tracking Routes ====================

@api_router.post("/shipping", response_model=dict)
async def create_shipping(
    shipping_data: ShippingCreate,
    current_user: dict = Depends(get_admin_user)
):
    """Create shipping info (Admin only)"""
    # Verify order exists
    order = next((o for o in database.orders if o.get('id') == shipping_data.order_id), None)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    shipping_info = ShippingInfo(
        order_id=shipping_data.order_id,
        carrier=shipping_data.carrier,
        tracking_number=shipping_data.tracking_number,
        status="shipped",
        shipped_at=datetime.now(timezone.utc)
    )
    doc = shipping_info.model_dump()
    doc['shipped_at'] = doc['shipped_at'].isoformat() if doc['shipped_at'] else None
    doc['estimated_delivery'] = doc['estimated_delivery'].isoformat() if doc['estimated_delivery'] else None
    doc['delivered_at'] = doc['delivered_at'].isoformat() if doc['delivered_at'] else None
    database.shipping.append(doc)
    database.save_shipping()
    
    # Update order status
    order['status'] = "shipped"
    database.save_orders()
    
    return doc

@api_router.get("/shipping/{order_id}", response_model=dict)
async def get_shipping_info(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get shipping info for an order"""
    # Verify order belongs to user or user is admin
    order = next((o for o in database.orders if o.get('id') == order_id), None)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.get('user_id') != current_user['id'] and not current_user.get('is_admin'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    shipping = next((s for s in database.shipping if s.get('order_id') == order_id), None)
    if not shipping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping info not found"
        )
    return shipping

@api_router.get("/tracking/{tracking_number}", response_model=dict)
async def track_shipment(tracking_number: str):
    """Track shipment by tracking number (public endpoint)"""
    shipping = next((s for s in database.shipping if s.get('tracking_number') == tracking_number), None)
    if not shipping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tracking number not found"
        )
    
    # Simulate tracking status updates
    carrier = shipping.get('carrier', '').lower()
    status = shipping.get('status', 'pending')
    
    # Mock tracking data based on carrier
    tracking_data = {
        "tracking_number": tracking_number,
        "carrier": shipping.get('carrier'),
        "status": status,
        "current_location": "Distribution Center" if status == "in_transit" else "Origin",
        "events": [
            {
                "date": shipping.get('shipped_at', datetime.now(timezone.utc).isoformat()),
                "status": "Shipped",
                "location": "Origin Warehouse"
            }
        ]
    }
    
    if status == "delivered":
        tracking_data["events"].append({
            "date": shipping.get('delivered_at', datetime.now(timezone.utc).isoformat()),
            "status": "Delivered",
            "location": "Destination"
        })
    
    return tracking_data

@api_router.put("/shipping/{order_id}", response_model=dict)
async def update_shipping_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_admin_user)
):
    """Update shipping status (Admin only)"""
    shipping = next((s for s in database.shipping if s.get('order_id') == order_id), None)
    if not shipping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping info not found"
        )
    
    shipping['status'] = status
    if status == "delivered":
        shipping['delivered_at'] = datetime.now(timezone.utc).isoformat()
        # Update order status
        order = next((o for o in database.orders if o.get('id') == order_id), None)
        if order:
            order['status'] = "delivered"
            database.save_orders()
    
    database.save_shipping()
    return shipping

# ==================== Returns & Refunds Routes ====================

@api_router.post("/returns", response_model=dict)
async def create_return_request(
    return_data: ReturnCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a return/refund request"""
    # Verify order exists and belongs to user
    order = next((o for o in database.orders if o.get('id') == return_data.order_id and o.get('user_id') == current_user['id']), None)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if order is eligible for return (e.g., delivered within last 14 days)
    if order.get('status') != 'delivered':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must be delivered to request return"
        )
    
    return_obj = ReturnRequest(
        order_id=return_data.order_id,
        user_id=current_user['id'],
        items=return_data.items,
        reason=return_data.reason
    )
    doc = return_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['processed_at'] = doc['processed_at'].isoformat() if doc['processed_at'] else None
    database.returns.append(doc)
    database.save_returns()
    return doc

@api_router.get("/returns", response_model=List[dict])
async def get_return_requests(current_user: dict = Depends(get_current_user)):
    """Get user's return requests"""
    returns = [r for r in database.returns if r.get('user_id') == current_user['id']]
    returns.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return returns

@api_router.get("/admin/returns", response_model=List[dict])
async def get_all_returns(current_user: dict = Depends(get_admin_user)):
    """Get all return requests (Admin only)"""
    returns = database.returns.copy()
    returns.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return returns

@api_router.put("/admin/returns/{return_id}", response_model=dict)
async def update_return_status(
    return_id: str,
    status: str,
    current_user: dict = Depends(get_admin_user)
):
    """Update return request status (Admin only)"""
    return_req = next((r for r in database.returns if r.get('id') == return_id), None)
    if not return_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Return request not found"
        )
    
    return_req['status'] = status
    if status == "processed":
        return_req['processed_at'] = datetime.now(timezone.utc).isoformat()
    
    database.save_returns()
    return return_req

# ==================== Application Setup ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    try:
        await connect_to_mongo()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Startup error: {e}")
        # Vercel'de dosya sistemi sorunları olabilir, devam et
    
    yield
    
    # Shutdown
    try:
        await close_mongo_connection()
    except Exception as e:
        logger.error(f"Shutdown error: {e}")

# Create FastAPI app
app = FastAPI(
    title="E-Commerce API",
    description="REST API for e-commerce platform",
    version="1.0.0",
    lifespan=lifespan
)

# Include API router
app.include_router(api_router)

# Security Headers Middleware - Optimized for all devices and production
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        
        # Security headers for all devices
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Performance headers
        response.headers["Connection"] = "keep-alive"
        
        return response

# Add security headers middleware (before CORS)
app.add_middleware(SecurityHeadersMiddleware)

# CORS Configuration - Optimized for https://chenki-hrra.vercel.app/ and all devices
def get_cors_origins():
    """Get CORS origins from environment or use defaults"""
    cors_env = os.environ.get('CORS_ORIGINS')
    if cors_env:
        return [origin.strip() for origin in cors_env.split(',') if origin.strip()]
    
    # Default origins: production frontend and local development
    default_origins = [
        "https://chenki-hrra.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    
    # In production, allow all subdomains of vercel.app for flexibility
    if IS_VERCEL:
        default_origins.append("https://*.vercel.app")
    
    return default_origins

# CORS Middleware - Optimized for all devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel subdomains
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Mount static files for uploads (Vercel'de çalışmaz)
if not IS_VERCEL:
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - Optimized for https://chenki-hrra.vercel.app/"""
    return {
        "message": "E-Commerce API",
        "version": "1.0.0",
        "docs": "/docs",
        "frontend_url": "https://chenki-hrra.vercel.app/",
        "status": "operational",
        "cors_enabled": True,
        "accessibility": "All devices supported"
    }

# Health check endpoint - Optimized for monitoring and all devices
@app.get("/health")
@app.get("/ping")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "frontend_url": "https://chenki-hrra.vercel.app/",
        "api_version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    # Run on all interfaces (0.0.0.0) to allow access from all devices
    # This allows the backend to be accessible from:
    # - Localhost: http://localhost:8000 or http://127.0.0.1:8000
    # - Network devices: http://[your-ip]:8000
    # - Vercel deployment: automatically configured via vercel.json
    uvicorn.run(
        app, 
        host="0.0.0.0",  # Listen on all network interfaces
        port=int(os.environ.get("PORT", 8000)),  # Use PORT env var or default to 8000
        log_level="info",
        access_log=True
    )
