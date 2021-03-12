const mongoose = require('mongoose');

const intentSchema = new mongoose.Schema({
  // action will now become intent.
  action: {
    type: String,
    default: null,
  },

  device: {
    type: String,
    default: null,
  },

  floor: {
    type: Number,
    default: null,
  },

  room: {
    type: String,
    default: null,
  },

  scale: {
    type: String,
    default: null,
  },

  level: {
    type: Number,
    default: null,
  },
});

const Intent = mongoose.model('Intent', intentSchema);
module.exports = { Intent };