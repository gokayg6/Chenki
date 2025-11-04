import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/cart`,
        {
          product_id: product.id,
          quantity: quantity,
          price: product.price
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Added to cart successfully');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Product not found</p>
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
            Back to Products
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="luxury-card rounded-lg overflow-hidden">
            <div className="aspect-square">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-4 py-1 bg-[#8b4513]/10 text-[#8b4513] rounded-full text-sm font-medium mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-[#8b4513] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-[#8b4513]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                ₺{product.price.toFixed(2)}
              </p>
            </div>

            <div className="border-t border-b border-[#8b4513]/10 py-6">
              <h3 className="text-lg font-semibold text-[#8b4513] mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Stock: {product.stock} available</p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Quantity:</span>
              <div className="flex items-center space-x-3">
                <Button
                  data-testid="decrease-quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  variant="outline"
                  size="icon"
                  className="border-[#8b4513] text-[#8b4513]"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span data-testid="quantity-display" className="text-xl font-semibold text-[#8b4513] w-12 text-center">{quantity}</span>
                <Button
                  data-testid="increase-quantity"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  variant="outline"
                  size="icon"
                  className="border-[#8b4513] text-[#8b4513]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              data-testid="add-to-cart-btn"
              onClick={addToCart}
              className="w-full bg-[#8b4513] hover:bg-[#654321] text-white py-6 text-lg"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;