const { getFirebaseAdminApp } = require('../services/firebaseAdmin');
const { getAuth } = require('firebase-admin/auth');

// @desc    Mint a Firebase custom auth token for the logged-in app user,
//          so the frontend can authenticate with Firebase Realtime Database
//          (used by the chat feature) without a separate Firebase login.
// @route   GET /api/firebase/custom-token
// @access  Private
const getCustomToken = async (req, res) => {
  try {
    const app = getFirebaseAdminApp();
    if (!app) {
      return res.status(503).json({ success: false, message: 'Firebase is not configured on the server' });
    }

    const uid = req.user._id.toString();
    const token = await getAuth(app).createCustomToken(uid, { role: req.user.role });

    res.status(200).json({ success: true, data: { token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomToken };
