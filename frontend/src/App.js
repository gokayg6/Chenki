import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Tracking from "./pages/Tracking";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && !user.is_admin) return <Navigate to="/" />;
    return children;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/product/:id" element={<ProductDetail user={user} />} />
          <Route path="/cart" element={<ProtectedRoute><Cart user={user} /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout user={user} /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account user={user} setUser={setUser} /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders user={user} /></ProtectedRoute>} />
          <Route path="/tracking/:trackingNumber" element={<Tracking />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard user={user} /></ProtectedRoute>} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;