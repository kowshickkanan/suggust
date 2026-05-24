import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Products from './pages/Products';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import CompareProducts from './pages/CompareProducts';
import { ComparisonProvider } from './context/ComparisonContext';
import { CartProvider } from './context/CartContext';
import ComparisonBar from './components/ComparisonBar';
import CustomCursor from './components/CustomCursor';
import ProductDetails from './pages/ProductDetails';
import RobotAuthForm from './components/RobotAuthForm';
import PriceTracker from './pages/PriceTracker';
import CartPage from './pages/CartPage';
import { Bot } from 'lucide-react';

function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ComparisonProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <CustomCursor />
            <Sidebar theme={theme} toggleTheme={toggleTheme} user={user} onLogout={handleLogout} />
            <main className="content-wrapper">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/compare" element={<CompareProducts />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/profile" element={<Profile user={user} />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cheap-buy" element={<PriceTracker />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/auth" element={<RobotAuthForm onLogin={handleLogin} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <ComparisonBar />
            <Link to="/chatbot" className="floating-bot-icon">
              <Bot size={28} />
            </Link>
          </div>
        </Router>
      </CartProvider>
    </ComparisonProvider>
  );
}

export default App;
