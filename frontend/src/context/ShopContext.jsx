import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import realApi from '../utils/api';

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

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [banners, setBanners] = useState([]);
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
      const [prodRes, catRes, banRes, setRes, offerRes] = await Promise.all([
        realApi.get('/products'),
        realApi.get('/categories'),
        realApi.get('/banners'),
        api.get('/settings'),
        realApi.get('/offers')
      ]);

      // Load custom products from localStorage
      let customProducts = [];
      try {
        const savedCustom = localStorage.getItem('sadabharat_custom_products');
        if (savedCustom) {
          customProducts = JSON.parse(savedCustom);
        }
      } catch (e) {
        console.error("Failed to parse custom products", e);
      }

      const apiProducts = prodRes.data.data.products || [];
      let mergedProducts = [...apiProducts];

      // Add custom products at the beginning if they don't already exist by _id
      customProducts.forEach(cp => {
        if (!mergedProducts.some(p => p._id === cp._id)) {
          mergedProducts.unshift(cp);
        }
      });

      setProducts(mergedProducts);

      const apiCategories = catRes.data.data;
      if (apiCategories && Array.isArray(apiCategories) && apiCategories.length > 0) {
        const mappedCategories = apiCategories.map(c => ({
          _id: c._id,
          name: c.title || c.name,
          image: c.url || c.image
        }));
        setCategories(mappedCategories);
      } else {
        setCategories([]);
      }

      const apiBanners = banRes.data.data.banners || [];
      setBanners(apiBanners);

      if (setRes.data.data.settings) {
        setSettings(setRes.data.data.settings);
      }

      if (offerRes.data.success && offerRes.data.data) {
        setOffers(offerRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch store data, using high-fidelity fallback:", err.message);
      
      // Attempt local storage fallback merge as well
      let customProducts = [];
      try {
        const savedCustom = localStorage.getItem('sadabharat_custom_products');
        if (savedCustom) {
          customProducts = JSON.parse(savedCustom);
        }
      } catch (e) {}

      let mergedProducts = [...(customProducts || [])];
      setProducts(mergedProducts);
      setCategories([]);
      setBanners([]);
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
      try {
        const res = await api.get('/users/profile');
        if (res.data.success) {
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

      const { items: _, totalAmount: __, couponCode: ___, ...restDetails } = details;
      const shippingAddress = {
        ...restDetails,
        postalCode: restDetails.pincode,
        country: restDetails.country || "India"
      };

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

      const { couponCode, ...restDetails } = details;
      const shippingAddress = {
        ...restDetails,
        postalCode: restDetails.pincode,
        country: restDetails.country || "India"
      };

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

  const logout = async () => {
    try {
      const fcmToken = localStorage.getItem('fcm_token_web');
      if (fcmToken) {
        await api.post('/notifications/remove-fcm-token', { token: fcmToken });
      }
    } catch (err) {
      console.error('FCM: Failed to remove token on logout', err);
    }

    const isAdminScope = window.location.pathname.startsWith('/admin');
    const isVendorScope = window.location.pathname.startsWith('/vendor');
    
    let tokenKey = 'customer_token';
    if (isAdminScope) tokenKey = 'admin_token';
    if (isVendorScope) tokenKey = 'vendor_token';
    
    localStorage.removeItem(tokenKey);
    localStorage.removeItem('fcm_token_web');
    localStorage.removeItem('vendor_auth');
    localStorage.removeItem('fcm_token_web');
    setIsAuthenticated(false);
    setUser(null);
  };

  const addProduct = useCallback((newProduct) => {
    setProducts(prev => {
      const exists = prev.some(p => p._id === newProduct._id);
      if (exists) return prev;

      // Save to localStorage
      try {
        const savedCustom = localStorage.getItem('sadabharat_custom_products');
        const customList = savedCustom ? JSON.parse(savedCustom) : [];
        if (!customList.some(p => p._id === newProduct._id)) {
          customList.push(newProduct);
          localStorage.setItem('sadabharat_custom_products', JSON.stringify(customList));
        }
      } catch (e) {
        console.error("Failed to save custom product to localStorage", e);
      }

      return [newProduct, ...prev];
    });
  }, []);

  return (
    <ShopContext.Provider value={{
      fetchData,
      products,
      categories,
      offers,
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
      addProduct,
      cartCount: cart.length,
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
