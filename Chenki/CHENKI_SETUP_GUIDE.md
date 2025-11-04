# Chenki E-Commerce Store - Setup Guide

## 🎉 Welcome to Chenki!

Your luxury e-commerce website is now ready! This guide will help you get started with managing your store.

## 📋 What's Included

### ✨ Features Implemented

1. **User Authentication**
   - JWT-based login/register system
   - User profile management
   - Secure password hashing with bcrypt

2. **Product Management**
   - Complete CRUD operations (Create, Read, Update, Delete)
   - Product categories
   - Stock management
   - Image support via URLs
   - Advanced filtering (search, category, price range)

3. **Shopping Cart**
   - Add/remove items
   - Update quantities
   - Persistent cart per user

4. **Order Management**
   - Order creation and tracking
   - Order history for users
   - Admin order management with status updates
   - Status options: pending, paid, processing, shipped, delivered, cancelled

5. **Payment Integration**
   - iyzico payment gateway integration
   - Secure card payment processing
   - Order confirmation after successful payment

6. **Admin Dashboard**
   - Product management interface
   - Order management system
   - Easy-to-use admin panel

7. **Beautiful UI/UX**
   - Luxury/Premium design with elegant fonts (Cormorant Garamond + Inter)
   - Sophisticated color palette (burgundy, gold accents, cream backgrounds)
   - Responsive design for all devices
   - Smooth animations and transitions

## 🔑 Default Admin Credentials

**Email:** admin@chenki.com  
**Password:** admin123

⚠️ **Important:** Please change these credentials after your first login!

## 💳 iyzico Payment Setup

To enable payment processing, you need to configure iyzico:

### Step 1: Get iyzico API Keys

1. Visit [iyzico Sandbox Registration](https://sandbox-merchant.iyzipay.com/)
2. Create a sandbox account (for testing)
3. Log in to your sandbox merchant panel
4. Navigate to: **Settings > Merchant Settings > API Keys**
5. Click **"Show detail"** to reveal your credentials
6. Copy your **API KEY** and **SECRET KEY**

### Step 2: Update Environment Variables

Edit `/app/backend/.env` and replace these values:

```env
IYZICO_API_KEY="your-actual-sandbox-api-key"
IYZICO_SECRET_KEY="your-actual-sandbox-secret-key"
IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"
```

### Step 3: Restart Backend

```bash
sudo supervisorctl restart backend
```

### Test Cards for Sandbox

Use these test cards in sandbox mode:

**Successful Payment:**
- Card Number: `5890040000000016`
- Expiry: Any future date (e.g., 12/2025)
- CVC: Any 3 digits (e.g., 123)
- Cardholder Name: Any name

**Insufficient Funds:**
- Card Number: `4111111111111129`

**More test cards:** [iyzico Test Cards Documentation](https://docs.iyzico.com/en/add-ons/test-cards)

### Production Setup

When ready to go live:

1. Create a production account at [iyzico](https://merchant.iyzipay.com/)
2. Get your production API keys
3. Update `.env`:
   ```env
   IYZICO_API_KEY="your-production-api-key"
   IYZICO_SECRET_KEY="your-production-secret-key"
   IYZICO_BASE_URL="https://api.iyzipay.com"
   ```

## 🚀 How to Use Your Store

### As Admin

1. **Login** to your admin account (admin@chenki.com)
2. Click **"Admin Dashboard"** in the header
3. **Manage Products:**
   - Click "Add Product" to create new products
   - Use "Edit" to modify existing products
   - Use "Delete" to remove products
   - Add product images via image URLs (use image hosting services or direct URLs)
4. **Manage Orders:**
   - Switch to "Orders" tab
   - Update order status using the dropdown
   - Track customer orders and payment status

### As Customer

1. **Browse Products:** View all products on the homepage
2. **Filter Products:** Use search, category filter, and price range
3. **View Details:** Click on any product to see full details
4. **Add to Cart:** Select quantity and add products to cart
5. **Checkout:** 
   - Review your cart
   - Enter shipping address
   - Enter payment details
   - Complete purchase
6. **Track Orders:** View order history in "My Account" > "View Orders"

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py          # FastAPI backend with all APIs
│   ├── .env              # Environment variables (configure iyzico here)
│   ├── requirements.txt  # Python dependencies
│   └── uploads/          # Uploaded product images
├── frontend/
│   └── src/
│       ├── App.js        # Main React component
│       ├── App.css       # Global styles (luxury theme)
│       └── pages/        # All page components
│           ├── Home.js           # Product listing & filters
│           ├── ProductDetail.js  # Product details
│           ├── Cart.js           # Shopping cart
│           ├── Checkout.js       # Payment & checkout
│           ├── Orders.js         # Order history
│           ├── Account.js        # User account
│           ├── AdminDashboard.js # Admin panel
│           ├── Login.js          # Login page
│           └── Register.js       # Registration page
```

## 🎨 Design Customization

### Changing Colors

Edit `/app/frontend/src/App.css`:

- **Primary Brown:** `#8b4513` (buttons, headings)
- **Dark Brown:** `#654321` (hover states)
- **Background:** `#faf7f2` and `#f5ede4` (gradient)

### Changing Fonts

The site uses:
- **Headings:** Cormorant Garamond (luxury serif)
- **Body:** Inter (modern sans-serif)

To change fonts, edit the Google Fonts import in App.css.

## 🗄️ Database

The application uses MongoDB with these collections:

- **users:** User accounts and authentication
- **products:** Product catalog
- **carts:** User shopping carts
- **orders:** Order records and history

Database name: `chenki_store`

## 🔐 Security Notes

1. **Change default admin password** after first login
2. **Update JWT_SECRET** in `.env` for production
3. **Never commit** `.env` file to version control
4. **Use HTTPS** in production
5. **Keep iyzico keys** secure and never expose them

## 📞 Support & Documentation

- **iyzico Documentation:** [docs.iyzico.com](https://docs.iyzico.com/en/)
- **iyzico Support:** Available through merchant dashboard
- **Test Cards:** [iyzico Test Cards](https://docs.iyzico.com/en/add-ons/test-cards)

## 🎯 Next Steps

1. ✅ Configure iyzico payment keys
2. ✅ Change default admin password
3. ✅ Add your products through Admin Dashboard
4. ✅ Test the complete checkout flow with test cards
5. ✅ Customize colors and branding (optional)
6. ✅ Test on different devices
7. ✅ When ready, switch to production iyzico keys

## 🌟 Features Summary

- ✅ Full-stack e-commerce platform
- ✅ User authentication & authorization
- ✅ Product catalog with filtering
- ✅ Shopping cart functionality
- ✅ Order management system
- ✅ Payment processing (iyzico)
- ✅ Admin dashboard
- ✅ Responsive luxury design
- ✅ Secure and professional backend

---

**Chenki** - Your Luxury Shopping Experience

Built with ❤️ using FastAPI, React, MongoDB, and iyzico
