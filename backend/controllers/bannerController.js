const Banner = require('../models/bannerModel');
const { invalidateCatalog } = require('../utils/cache');

const normalizeSlot = (body = {}) => {
  const slot = Math.max(1, parseInt(body.slot ?? body.sequence ?? 1, 10) || 1);
  return { slot, sequence: slot };
};

const getBanners = async (req, res) => {
  try {
    const banners = (await Banner.find({}).sort({ slot: 1, sequence: 1, createdAt: -1 }).lean())
      .map((banner, index) => {
        const slot = banner.slot || banner.sequence || index + 1;
        return { ...banner, slot, sequence: banner.sequence || slot };
      });
    res.status(200).json({ success: true, data: { banners } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create({ ...req.body, ...normalizeSlot(req.body) });
    invalidateCatalog('banners').catch(() => {});
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...normalizeSlot(req.body) },
      { new: true, runValidators: true }
    );
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    invalidateCatalog('banners').catch(() => {});
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    await banner.deleteOne();
    invalidateCatalog('banners').catch(() => {});
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
