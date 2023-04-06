const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orders: [
      {
        bar: {
          type: mongoose.Schema.ObjectId,
          ref: 'Bar',
          required: [true, 'Order must have a bar'],
        },
        count: {
          type: Number,
          required: [true, 'Order must have a count'],
        },
      },
    ],
    ticket: {
      type: mongoose.Schema.ObjectId,
      ref: 'Ticket',
      required: [true, 'Order must have a ticket'],
    },
    processed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.index({ ticket: 1 }, { unique: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
