import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

import { initialProducts } from '../data/products';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

const FlyItem = ({ item, onComplete }) => {
  const [position, setPosition] = useState({ x: item.startX, y: item.startY, scale: 1, opacity: 1 });

  useEffect(() => {
    const targetIcon = document.getElementById(`global-${item.targetType}-icon`);
    if (targetIcon) {
      const rect = targetIcon.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2 - 25; // center 50px image
      const targetY = rect.top + rect.height / 2 - 25;

      requestAnimationFrame(() => {
        setPosition({ x: targetX, y: targetY, scale: 0.1, opacity: 0.5 });
      });
    }

    const timer = setTimeout(() => onComplete(item.id), 600);
    return () => clearTimeout(timer);
  }, [item, onComplete]);

  return (
    <img
      src={item.image}
      alt="flying product"
      className="fixed z-[9999] rounded-full shadow-2xl pointer-events-none object-cover border-2 border-white"
      style={{
        width: '50px',
        height: '50px',
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
        opacity: position.opacity,
        transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.6s ease-in'
      }}
    />
  );
};

const fallbackCategories = [
  { _id: 'cat-1', name: 'Hair Care' },
  { _id: 'cat-2', name: 'Skin Care' },
  { _id: 'cat-3', name: 'Health Care' },
  { _id: 'cat-4', name: 'Herbal Tea' },
  { _id: 'cat-5', name: 'Supplements' },
  { _id: 'cat-6', name: 'Body Care' },
  { _id: 'cat-7', name: 'Aromatherapy' },
  { _id: 'cat-8', name: 'Baby Care' }
];

const fallbackBanners = [
  {
    _id: 'ayur-slide-1',
    title: 'Pure Ayurvedic\nGoodness',
    subtitle: '100% NATURAL',
    description: 'Natural ingredients for a healthy body, mind & soul',
    image: '/ayurvedic_hero.png',
    link: '/shop'
  }
];

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(fallbackCategories);
  const [banners, setBanners] = useState(fallbackBanners);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [settings, setSettings] = useState({
    taxRate: 18,
    deliveryCharge: 50,
    freeDeliveryThreshold: 1000,
    estDeliveryDays: '3-5 Business Days',
    shippingPartner: 'Standard Courier',
    trackingUrl: 'https://shiprocket.co/tracking/',
    supportContact: '+91 74071 75567'
  });
  const [loading, setLoading] = useState(true);

  // Order States
  const [lastOrder, setLastOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Flying Animation State
  const [flyingItems, setFlyingItems] = useState([]);

  const triggerFlyToCart = (e, image) => {
    if (!e || !image) return;
    const rect = e.target.getBoundingClientRect();
    setFlyingItems(prev => [...prev, {
      id: Date.now() + Math.random(),
      startX: rect.left + rect.width / 2,
      startY: rect.top + rect.height / 2,
      image,
      targetType: 'cart'
    }]);
  };

  const triggerFlyToWishlist = (e, image) => {
    if (!e || !image) return;
    const rect = e.target.getBoundingClientRect();
    setFlyingItems(prev => [...prev, {
      id: Date.now() + Math.random(),
      startX: rect.left + rect.width / 2,
      startY: rect.top + rect.height / 2,
      image,
      targetType: 'wishlist'
    }]);
  };

  const handleFlyAnimationComplete = useCallback((id) => {
    setFlyingItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Fetch Core Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, banRes, setRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/banners'),
        api.get('/settings')
      ]);

      const apiProducts = prodRes.data.data.products;
      if (apiProducts && apiProducts.length > 0 && apiProducts.some(p => p.name?.toLowerCase().includes('bhringraj') || p.category?.toLowerCase().includes('hair'))) {
        setProducts(apiProducts);
      } else {
        setProducts(initialProducts);
      }

      const apiCategories = catRes.data.data.categories;
      if (apiCategories && apiCategories.length > 0) {
        setCategories(apiCategories);
      } else {
        setCategories(fallbackCategories);
      }

      const apiBanners = banRes.data.data.banners;
      if (apiBanners && apiBanners.length > 0) {
        setBanners(apiBanners);
      } else {
        setBanners(fallbackBanners);
      }

      if (setRes.data.data.settings) {
        setSettings(setRes.data.data.settings);
      }
    } catch (err) {
      console.error("Failed to fetch store data, using high-fidelity fallback:", err.message);
      setProducts(initialProducts);
      setCategories(fallbackCategories);
      setBanners(fallbackBanners);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check Authentication Status
  const checkAuth = useCallback(async () => {
    const isAdminScope = window.location.pathname.startsWith('/admin');
    const tokenKey = isAdminScope ? 'admin_token' : 'customer_token';
    const token = localStorage.getItem(tokenKey);

    if (token) {
      // --- MOCK SUCCESS FOR UI TESTING ---
      if (token === "mock-token-123") {
        setIsAuthenticated(true);
        setUser({ name: 'Test User', role: isAdminScope ? 'admin' : 'customer' });
        setIsAuthLoading(false);
        return;
      }
      // -----------------------------------

      try {
        const res = await api.get('/auth/me');
        if (res.data.status === 'success') {
          setIsAuthenticated(true);
          setUser(res.data.data.user);
        }
      } catch (err) {
        localStorage.removeItem(tokenKey);
        setIsAuthenticated(false);
        setUser(null);
      }
    }

    // Auth has definitively concluded checking (even if no token existed)
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    checkAuth();

    // Load local storage items
    try {
      const savedCart = localStorage.getItem('saundarya_cart');
      const savedWishlist = localStorage.getItem('saundarya_wishlist');
      if (savedCart && savedCart !== "undefined") setCart(JSON.parse(savedCart));
      if (savedWishlist && savedWishlist !== "undefined") setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, [fetchData, checkAuth]);

  // Sync Cart/Wishlist back to local storage
  useEffect(() => {
    localStorage.setItem('saundarya_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('saundarya_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const verifyAndClearCart = async (razorpayResponse, details, customTotal, breakdown) => {
    try {
      if (!isAuthenticated) throw new Error("User unauthorized.");

      const { items: _, totalAmount: __, couponCode: ___, ...shippingAddress } = details;

      const payload = {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        orderDetails: {
          items: (details.items || cart).map(item => ({
            product: item.product || item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size || item.selectedSize
          })),
          subTotal: breakdown?.subtotal,
          taxAmount: breakdown?.taxAmount,
          taxRate: breakdown?.taxRate,
          shippingAmount: breakdown?.shippingValue,
          actualShippingAmount: breakdown?.actualShipping,
          totalAmount: customTotal,
          shippingAddress,
          couponCode: details.couponCode
        }
      };

      const res = await api.post('/orders/razorpay/verify', payload);
      const newId = res.data.data.order.orderId;

      setOrderId(newId);
      setOrderDetails(details);
      setLastOrder([...cart]);
      setCart([]);
      return newId;
    } catch (err) {
      console.error("Payment verification error:", err);
      alert('Payment Verification Failed: ' + (err.response?.data?.message || err.message));
      throw err;
    }
  };

  const clearCart = async (details, customTotal, breakdown) => {
    try {
      if (!isAuthenticated) {
        alert("Please login or create an account to process your divine purchase.");
        throw new Error("User unauthorized.");
      }

      const defaultTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const totalAmount = customTotal !== undefined ? customTotal : defaultTotal;

      const { couponCode, ...shippingAddress } = details;

      const payload = {
        items: (details.items || cart).map(item => ({
          product: item.product || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size || item.selectedSize
        })),
        subTotal: breakdown?.subtotal,
        taxAmount: breakdown?.taxAmount,
        taxRate: breakdown?.taxRate,
        shippingAmount: breakdown?.shippingValue,
        actualShippingAmount: breakdown?.actualShipping,
        totalAmount: totalAmount,
        shippingAddress,
        couponCode: details.couponCode || null
      };

      const res = await api.post('/orders', payload);
      const newId = res.data.data.order.orderId;

      setOrderId(newId);
      setOrderDetails(details);
      setLastOrder([...cart]);
      setCart([]);
      return newId;
    } catch (err) {
      console.error("Clear cart error:", err);
      alert('Order generation failed: ' + (err.response?.data?.message || err.message));
      throw err;
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id && item.selectedSize === product.selectedSize);
      if (existing) {
        return prev.map(item =>
          (item._id === product._id && item.selectedSize === product.selectedSize) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCart(prev => prev.filter(item => !(item._id === productId && item.selectedSize === size)));
  };

  const updateQuantity = (productId, size, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id === productId && item.selectedSize === size) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.filter(item => item._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  const logout = () => {
    const isAdminScope = window.location.pathname.startsWith('/admin');
    const tokenKey = isAdminScope ? 'admin_token' : 'customer_token';
    localStorage.removeItem(tokenKey);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <ShopContext.Provider value={{
      fetchData,
      products,
      categories,
      banners,
      cart,
      wishlist,
      loading,
      isAuthLoading,
      isCartDrawerOpen,
      setIsCartDrawerOpen,
      isAuthenticated,
      setIsAuthenticated,
      user,
      setUser,
      logout,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleWishlist,
      isInWishlist,
      triggerFlyToCart,
      triggerFlyToWishlist,
      lastOrder,
      orderId,
      setOrderId,
      orderDetails,
      clearCart,
      verifyAndClearCart,
      settings,
      cartCount: cart.reduce((acc, item) => acc + item.quantity, 0),
      wishlistCount: wishlist.length,
      cartTotal: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    }}>
      {children}
      {flyingItems.map(item => (
        <FlyItem key={item.id} item={item} onComplete={handleFlyAnimationComplete} />
      ))}
    </ShopContext.Provider>
  );
};
