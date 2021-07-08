const mongoose = require('mongoose');

const intentrecordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  // empty array equals infinite potential value
  slots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    default: [],
  }],

  count: {
    type: Number,
    default: 0,
  },
})

const IntentRecord = mongoose.model('IntentRecord', intentrecordSchema);

module.exports = { IntentRecord }