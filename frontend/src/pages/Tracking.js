import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Truck, Package, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
const API = `${BACKEND_URL}/api`;

const Tracking = () => {
  const { trackingNumber } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingInfo();
    }
  }, [trackingNumber]);

  const fetchTrackingInfo = async () => {
    try {
      const response = await axios.get(`${API}/tracking/${trackingNumber}`);
      setTrackingData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      toast.error('Tracking information not found');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Package className="h-5 w-5 text-indigo-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      shipped: 'bg-indigo-500',
      in_transit: 'bg-blue-500',
      delivered: 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading tracking information...</p>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen pb-20">
        <header className="bg-white/80 backdrop-blur-md border-b border-[#8b4513]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to="/orders" className="inline-flex items-center text-[#8b4513] hover:text-[#654321]">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xl text-gray-600">Tracking information not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#8b4513]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/orders" className="inline-flex items-center text-[#8b4513] hover:text-[#654321]">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Orders
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#8b4513] mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Track Your Order
        </h1>

        <div className="luxury-card rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
              <p className="text-2xl font-mono font-bold text-[#8b4513]">{trackingData.tracking_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Carrier</p>
              <p className="text-lg font-semibold">{trackingData.carrier}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(trackingData.status)}
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={`${getStatusColor(trackingData.status)} text-white mt-1`}>
                  {trackingData.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            {trackingData.current_location && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{trackingData.current_location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Events */}
        {trackingData.events && trackingData.events.length > 0 && (
          <div className="luxury-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#8b4513] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Tracking History
            </h2>
            <div className="space-y-4">
              {trackingData.events.map((event, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b border-[#8b4513]/10 last:border-0">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(event.status.toLowerCase())}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#8b4513]">{event.status}</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;

