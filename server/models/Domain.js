const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },

  intents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IntentRecord',
    default: [],
  }],

  campaignName: {
    type: String,
    default: null,
  },

  campaignID: {
    type: String,
    default: null,
  }
})

const Domain = mongoose.model('Domain', domainSchema);

module.exports = { Domain }