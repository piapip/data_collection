const mongoose = require('mongoose');

const intentSchema = new mongoose.Schema({
  intent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IntentRecord',
    default: null,
  },

  // empty array means it has no value, slots and subslots are treated equally here.
  // After all, subslots are still slots.
  slots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    default: [],
  }],

  slot_values: [{
    type: String,
    default: [],
  }]
});

const Intent = mongoose.model('Intent', intentSchema);
module.exports = { Intent };