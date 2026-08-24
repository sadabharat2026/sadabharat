const Testimonial = require('../models/testimonialModel');

const getPublicTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: { testimonials }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicTestimonials
};
