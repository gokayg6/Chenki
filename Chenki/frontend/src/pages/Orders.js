import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      paid: 'bg-blue-500',
      processing: 'bg-purple-500',
      shipped: 'bg-indigo-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading orders...</p>
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
            Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#8b4513] mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-6">No orders yet</p>
            <Link to="/">
              <button className="btn-primary">Start Shopping</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="luxury-card rounded-lg p-6" data-testid={`order-${order.id}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p data-testid={`order-id-${order.id}`} className="text-lg font-semibold text-[#8b4513]">{order.id}</p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white`} data-testid={`order-status-${order.id}`}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="border-t border-[#8b4513]/10 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span className="font-medium">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span data-testid={`order-amount-${order.id}`} className="text-xl font-bold text-[#8b4513]">
                      ₺{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="font-medium">{order.items.length} item(s)</span>
                  </div>
                  {order.payment_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID</span>
                      <span className="text-sm font-mono text-gray-500">{order.payment_id}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;