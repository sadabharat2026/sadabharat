const Offer = require('../models/offerModel');
const { invalidateCatalog } = require('../utils/cache');

// @desc    Get all offers
// @route   GET /api/offers
// @access  Public
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort('-createdAt').lean();
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private/Admin
const createOffer = async (req, res) => {
  try {
    const { title, badge, category, image, discountValue, isActive } = req.body;
    
    const offer = await Offer.create({
      title,
      badge,
      category,
      image,
      discountValue,
      isActive
    });

    invalidateCatalog('offers').catch(() => {});
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    invalidateCatalog('offers').catch(() => {});
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    invalidateCatalog('offers').catch(() => {});
    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer
};
