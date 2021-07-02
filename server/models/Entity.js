const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema({
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

  // for example: entity "District" has priority lower than "City"
  // if "City" has 5 values in slot "city_name" then "District" will have 5 slots equivalent to that 5 values.
  lowerThan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity',
    default: null,
  },

  // for example: entity "City" might have more than just one slot "name"
  // so we need to specify which slot that the entity "District" will depend on.
  dependency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    default: null,
  }
})

const Entity = mongoose.model('Entity', entitySchema);

module.exports = { Entity }