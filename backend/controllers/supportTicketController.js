const SupportTicket = require('../models/supportTicketModel');

// @desc    Create a support ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const { subject, description, priority, orderId } = req.body;

    if (!subject || !description) {
      res.status(400);
      throw new Error('Please fill in required fields');
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      description,
      priority,
      orderId
    });

    res.status(201).json({
      success: true,
      data: ticket
    });

    // Notify Admins
    try {
      const { sendNotificationToUser } = require('../utils/pushNotificationHelper');
      await sendNotificationToUser(
        null,
        'admin',
        {
          title: 'New Support Ticket',
          body: `Ticket #${ticket._id} created by user.`
        },
        'info'
      );
    } catch (err) {
      console.error('FCM Ticket Error:', err);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: { tickets }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets/admin
// @access  Private (Admin only)
const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({})
      .populate('user', 'name email')
      .sort('-createdAt');
    res.status(200).json({
      success: true,
      data: { tickets }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status / admin note
// @route   PATCH /api/tickets/:id
// @access  Private (Admin only)
const updateTicket = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    let ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: ticket
    });

    // Notify User
    try {
      const { sendNotificationToUser } = require('../utils/pushNotificationHelper');
      await sendNotificationToUser(
        ticket.user,
        'user',
        {
          title: 'Support Ticket Updated',
          body: `Your ticket #${ticket._id} status is now ${status}.`
        },
        'info'
      );
    } catch (err) {
      console.error('FCM Ticket Update Error:', err);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket
};
