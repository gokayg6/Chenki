import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = ({ user }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    contact_name: '',
    address: '',
    city: '',
    zip_code: '',
    country: 'Turkey'
  });
  const [cardDetails, setCardDetails] = useState({
    card_number: '',
    card_holder_name: '',
    expire_month: '',
    expire_year: '',
    cvc: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    }
  };

  const calculateTotal = () => {
    return cart.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Create order first
      const orderResponse = await axios.post(
        `${API}/orders`,
        {
          items: cart.items,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          buyer_info: {
            name: user.name.split(' ')[0] || 'Customer',
            surname: user.name.split(' ')[1] || 'Customer',
            identity_number: '11111111111'
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Process payment
      const paymentResponse = await axios.post(
        `${API}/payment/process`,
        {
          order_id: orderResponse.data.id,
          ...cardDetails
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (paymentResponse.data.success) {
        toast.success('Payment successful! Order placed.');
        navigate('/orders');
      } else {
        toast.error(paymentResponse.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#8b4513] mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="luxury-card rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <MapPin className="h-6 w-6 text-[#8b4513] mr-3" />
                  <h2 className="text-2xl font-bold text-[#8b4513]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    Shipping Address
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact_name">Full Name</Label>
                    <Input
                      data-testid="contact-name"
                      id="contact_name"
                      required
                      value={shippingAddress.contact_name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, contact_name: e.target.value })}
                      className="luxury-input mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      data-testid="address"
                      id="address"
                      required
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="luxury-input mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        data-testid="city"
                        id="city"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="luxury-input mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip_code">Zip Code</Label>
                      <Input
                        data-testid="zip-code"
                        id="zip_code"
                        required
                        value={shippingAddress.zip_code}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zip_code: e.target.value })}
                        className="luxury-input mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="luxury-card rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <CreditCard className="h-6 w-6 text-[#8b4513] mr-3" />
                  <h2 className="text-2xl font-bold text-[#8b4513]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    Payment Details
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card_holder_name">Cardholder Name</Label>
                    <Input
                      data-testid="card-holder-name"
                      id="card_holder_name"
                      required
                      value={cardDetails.card_holder_name}
                      onChange={(e) => setCardDetails({ ...cardDetails, card_holder_name: e.target.value })}
                      className="luxury-input mt-1"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="card_number">Card Number</Label>
                    <Input
                      data-testid="card-number"
                      id="card_number"
                      required
                      value={cardDetails.card_number}
                      onChange={(e) => setCardDetails({ ...cardDetails, card_number: e.target.value })}
                      className="luxury-input mt-1"
                      placeholder="5890040000000016"
                      maxLength="16"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expire_month">Month</Label>
                      <Input
                        data-testid="expire-month"
                        id="expire_month"
                        required
                        value={cardDetails.expire_month}
                        onChange={(e) => setCardDetails({ ...cardDetails, expire_month: e.target.value })}
                        className="luxury-input mt-1"
                        placeholder="12"
                        maxLength="2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expire_year">Year</Label>
                      <Input
                        data-testid="expire-year"
                        id="expire_year"
                        required
                        value={cardDetails.expire_year}
                        onChange={(e) => setCardDetails({ ...cardDetails, expire_year: e.target.value })}
                        className="luxury-input mt-1"
                        placeholder="2025"
                        maxLength="4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        data-testid="cvc"
                        id="cvc"
                        required
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="luxury-input mt-1"
                        placeholder="123"
                        maxLength="3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="luxury-card rounded-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-[#8b4513] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Order Summary
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cart.items?.length || 0})</span>
                    <span data-testid="items-total">₺{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-[#8b4513]/10 pt-3 flex justify-between text-xl font-bold text-[#8b4513]">
                    <span>Total</span>
                    <span data-testid="order-total">₺{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  data-testid="place-order-btn"
                  type="submit"
                  disabled={loading || !cart.items || cart.items.length === 0}
                  className="w-full bg-[#8b4513] hover:bg-[#654321] text-white py-6 text-lg"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;