const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  // empty values array and empty subSlots equals infinite potential value
  values: [{
    type: String,
    default: [],
  }],

  // for example: slot "District" has priority lower than "City"
  // if "City" has 5 values in slot "city_name" then "District" will have 5 subslots equivalent to that 5 values.
  lowerThan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    default: null,
  },

  // For example: District has all kinds of subslots
  subSlots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    default: [],
  }],
})

const Slot = mongoose.model('Slot', slotSchema);

module.exports = { Slot }