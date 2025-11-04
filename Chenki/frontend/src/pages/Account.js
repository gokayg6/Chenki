import { Link } from 'react-router-dom';
import { User, Package, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Account = ({ user, setUser }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#8b4513] mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          My Account
        </h1>

        <div className="space-y-6">
          {/* Profile Info */}
          <div className="luxury-card rounded-lg p-8">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-[#8b4513] mr-3" />
              <h2 className="text-2xl font-bold text-[#8b4513]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Profile Information
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-lg font-medium text-[#8b4513]">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium text-[#8b4513]">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="text-lg font-medium text-[#8b4513]">{user.is_admin ? 'Admin' : 'Customer'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="luxury-card rounded-lg p-8">
            <h2 className="text-2xl font-bold text-[#8b4513] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/orders">
                <Button data-testid="view-orders-btn" className="w-full bg-[#8b4513] hover:bg-[#654321] text-white py-6">
                  <Package className="h-5 w-5 mr-2" />
                  View Orders
                </Button>
              </Link>
              {user.is_admin && (
                <Link to="/admin">
                  <Button data-testid="admin-dashboard-btn" variant="outline" className="w-full border-[#8b4513] text-[#8b4513] py-6">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <Button
                data-testid="logout-btn"
                onClick={handleLogout}
                variant="outline"
                className="w-full border-red-500 text-red-500 hover:bg-red-50 py-6"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;