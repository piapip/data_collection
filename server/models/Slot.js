const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  // empty array equals infinite potential value
  values: [{
    type: String,
  }],

  
})

const Slot = mongoose.model('Slot', slotSchema);

module.exports = { Slot }