import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
const API = `${BACKEND_URL}/api`;

const Cart = ({ user }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`${API}/cart`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCart(response.data);
      
      // Fetch product details
      const productIds = response.data.items?.map(item => item.product_id) || [];
      const productData = {};
      for (const id of productIds) {
        try {
          const prod = await axios.get(`${API}/products/${id}`);
          productData[id] = prod.data;
        } catch (err) {
          console.error(`Error fetching product ${id}:`, err);
        }
      }
      setProducts(productData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('Failed to load cart');
      }
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.put(
        `${API}/cart/${productId}?quantity=${newQuantity}`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      fetchCart();
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('Failed to update cart');
      }
    }
  };

  const removeItem = async (productId) => {
    await updateQuantity(productId, 0);
  };

  const calculateTotal = () => {
    return cart.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };

  const handleCheckout = () => {
    if (!cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#8b4513]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center text-[#8b4513] hover:text-[#654321]">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#8b4513] mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Shopping Cart
        </h1>

        {!cart.items || cart.items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <Link to="/">
              <Button className="bg-[#8b4513] hover:bg-[#654321] text-white">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const product = products[item.product_id];
                if (!product) return null;

                return (
                  <div key={item.product_id} className="luxury-card rounded-lg p-6" data-testid={`cart-item-${item.product_id}`}>
                    <div className="flex items-center space-x-6">
                      <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#8b4513]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{product.category}</p>
                        <p className="text-lg font-bold text-[#8b4513] mt-2">
                          ₺{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          data-testid={`decrease-${item.product_id}`}
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          variant="outline"
                          size="icon"
                          className="border-[#8b4513] text-[#8b4513]"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span data-testid={`quantity-${item.product_id}`} className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          data-testid={`increase-${item.product_id}`}
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          variant="outline"
                          size="icon"
                          className="border-[#8b4513] text-[#8b4513]"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        data-testid={`remove-${item.product_id}`}
                        onClick={() => removeItem(item.product_id)}
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="luxury-card rounded-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-[#8b4513] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Order Summary
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span data-testid="subtotal">₺{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-[#8b4513]/10 pt-3 flex justify-between text-xl font-bold text-[#8b4513]">
                    <span>Total</span>
                    <span data-testid="total">₺{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  data-testid="checkout-btn"
                  onClick={handleCheckout}
                  className="w-full bg-[#8b4513] hover:bg-[#654321] text-white py-6 text-lg"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;