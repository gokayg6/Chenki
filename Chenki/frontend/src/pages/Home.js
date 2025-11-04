import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, User, Search, Filter, LogOut, Mail, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BubbleBackground from '@/components/BubbleBackground';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      
      const response = await axios.get(`${API}/products?${params.toString()}`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilter = () => {
    fetchProducts({
      category: selectedCategory,
      search: searchQuery,
      min_price: priceRange.min,
      max_price: priceRange.max
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const addToCart = async (product) => {
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
          quantity: 1,
          price: product.price
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen page-enter">
      <BubbleBackground />
      
      {/* Header */}
      <header className="glass-effect border-b border-[#8b4513]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-4xl font-bold text-[#8b4513]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Chenki</h1>
            </Link>
            
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <Link to="/cart" data-testid="cart-link">
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingCart className="h-5 w-5 text-[#8b4513]" />
                    </Button>
                  </Link>
                  <Link to="/account" data-testid="account-link">
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5 text-[#8b4513]" />
                    </Button>
                  </Link>
                  {user.is_admin && (
                    <Link to="/admin" data-testid="admin-link">
                      <Button variant="outline" className="border-[#8b4513] text-[#8b4513]">
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="logout-btn">
                    <LogOut className="h-5 w-5 text-[#8b4513]" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" data-testid="login-link">
                    <Button variant="outline" className="border-[#8b4513] text-[#8b4513]">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" data-testid="register-link">
                    <Button className="bg-[#8b4513] hover:bg-[#654321] text-white">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative z-10 animated-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#8b4513] mb-6 text-reveal" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Luxury Shopping Experience
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 text-reveal" style={{ animationDelay: '0.2s' }}>
            Discover our curated collection of premium products
          </p>
          <div className="flex items-center justify-center space-x-4 text-reveal" style={{ animationDelay: '0.3s' }}>
            <Link to="/about">
              <Button variant="outline" className="border-[#8b4513] text-[#8b4513] hover:bg-[#8b4513] hover:text-white transition-all duration-300">
                <Info className="h-4 w-4 mr-2" />
                About Us
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-[#8b4513] text-[#8b4513] hover:bg-[#8b4513] hover:text-white transition-all duration-300">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="glass-effect rounded-lg p-6 shadow-lg border border-[#8b4513]/10 scale-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                data-testid="search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 luxury-input"
                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="category-select" className="luxury-input">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              data-testid="min-price-input"
              placeholder="Min Price"
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="luxury-input"
            />
            
            <Input
              data-testid="max-price-input"
              placeholder="Max Price"
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="luxury-input"
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              data-testid="apply-filters-btn"
              onClick={handleFilter}
              className="bg-[#8b4513] hover:bg-[#654321] text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 fade-in-up">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="luxury-card rounded-lg overflow-hidden fade-in-up" 
                data-testid={`product-card-${product.id}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden bg-gray-100 product-image-container">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-xl font-semibold text-[#8b4513] mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#8b4513]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      ₺{product.price.toFixed(2)}
                    </span>
                    <Button
                      data-testid={`add-to-cart-${product.id}`}
                      onClick={() => addToCart(product)}
                      className="bg-[#8b4513] hover:bg-[#654321] text-white"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#2d2424] text-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Chenki</h3>
              <p className="text-gray-400">Luxury Shopping Experience</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/orders" className="text-gray-400 hover:text-white transition-colors">Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@chenki.com</li>
                <li>+90 (212) 555-0123</li>
                <li>Istanbul, Turkey</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2025 Chenki. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;