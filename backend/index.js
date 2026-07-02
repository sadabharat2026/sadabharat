require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const offerRoutes = require('./routes/offerRoutes');
const couponRoutes = require('./routes/couponRoutes');
const blogRoutes = require('./routes/blogRoutes');
const shippingRoutes = require('./routes/shipping.routes');
const { errorHandler } = require('./middlewares/errorHandler');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/shipping', shippingRoutes);
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admins', adminRoutes);
const testimonialRoutes = require('./routes/testimonialRoutes');
app.use('/api/testimonials', testimonialRoutes);
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);
const consultationRoutes = require('./routes/consultationRoutes');
app.use('/api/consultations', consultationRoutes);
const supportTicketRoutes = require('./routes/supportTicketRoutes');
app.use('/api/tickets', supportTicketRoutes);
const instagramPostRoutes = require('./routes/instagramPostRoutes');
app.use('/api/instagram', instagramPostRoutes);
const storeLocationRoutes = require('./routes/storeLocationRoutes');
app.use('/api/locations', storeLocationRoutes);
const policyRoutes = require('./routes/policyRoutes');
app.use('/api/policies', policyRoutes);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Nodemon trigger comment

