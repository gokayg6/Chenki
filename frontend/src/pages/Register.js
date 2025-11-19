import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BubbleBackground from '@/components/BubbleBackground';
import GlassButton from '@/components/GlassButton';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
const API = `${BACKEND_URL}/api`;

const Register = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter">
      <BubbleBackground />
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 fade-in-up">
          <Link to="/">
            <h1 className="text-5xl font-bold text-[#8b4513] mb-2 gold-accent" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Chenki</h1>
          </Link>
          <p className="text-gray-600">Create your account</p>
        </div>

        <div className="luxury-card rounded-lg p-8 scale-in" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-[#8b4513] font-medium">Full Name</Label>
              <Input
                data-testid="name-input"
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="luxury-input mt-1"
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-[#8b4513] font-medium">Email</Label>
              <Input
                data-testid="email-input"
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="luxury-input mt-1"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#8b4513] font-medium">Password</Label>
              <Input
                data-testid="password-input"
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="luxury-input mt-1"
                placeholder="••••••••"
              />
            </div>

            <GlassButton
              data-testid="register-btn"
              type="submit"
              disabled={loading}
              variant="primary"
              icon={<UserPlus className="h-5 w-5" />}
              className="w-full py-6 text-lg elastic-bounce"
              style={{ animationDelay: '0.3s' }}
            >
              {loading ? 'Creating account...' : 'Register'}
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" data-testid="login-link" className="text-[#8b4513] font-medium hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;