const mongoose = require('mongoose');

const intentSchema = new mongoose.Schema({
  intent: {
    type: Number,
    min: 1,
    max: 18,
    default: null,
  },

  loan_purpose: {
    type: Number,
    min: 1,
    max: 18,
    default: null,
  },

  loan_type: {
    type: Number,
    min: 1,
    max: 3,
    default: null,
  },

  card_type: {
    type: Number,
    min: 1,
    max: 7,
    default: null,
  },

  card_usage: {
    type: Number,
    min: 1,
    max: 7,
    default: null,
  },

  digital_bank: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },

  card_activation_type: {
    type: Number,
    min: 1,
    max: 2,
    default: null,
  },

  // need fix
  district: {
    type: Number,
    min: 1,
    max: 30,
    default: null,
  },

  // need fix
  city: {
    type: Number,
    min: 1,
    max: 30,
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