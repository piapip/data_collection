const mongoose = require('mongoose');

const intentSchema = new mongoose.Schema({
  intent: {
    type: Number,
    min: 0,
    max: 17,
    default: null,
  },

  loan_purpose: {
    type: Number,
    min: 0,
    max: 5,
    default: null,
  },

  loan_type: {
    type: Number,
    min: 0,
    max: 2,
    default: null,
  },

  card_type: {
    type: Number,
    min: 0,
    max: 6,
    default: null,
  },

  card_usage: {
    type: Number,
    min: 0,
    max: 1,
    default: null,
  },

  digital_bank: {
    type: Number,
    min: 0,
    max: 4,
    default: null,
  },

  card_activation_type: {
    type: Number,
    min: 0,
    max: 1,
    default: null,
  },

  // need fix
  district: {
    type: String,
    // type: Number,
    // min: 0,
    // max: 30,
    default: null,
  },

  // need fix
  city: {
    type: String,
    // type: Number,
    // min: 0,
    // max: 30,
    default: null,
  },
  
  name: {
    type: String,
    default: null,
  },

  cmnd: {
    type: String,
    default: null,
  },

  four_last_digits: {
    type: String,
    default: null,
  },
});

const Intent = mongoose.model('Intent', intentSchema);
module.exports = { Intent };