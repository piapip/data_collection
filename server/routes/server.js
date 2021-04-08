const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Chatroom } = require("../models/Chatroom");
const { Audio } = require("../models/Audio");

// count user
router.get("/user", (req, res) => {
  User.estimatedDocumentCount((err, count) => {
    if (err) res.status(500).send({ success: false, err })
    return res.status(200).send({
      success: true,
      count
    })
  });
});

// count room done
router.get("/room", (req, res) => {
  Chatroom.estimatedDocumentCount({done: true}, (err, count) => {
    if (err) res.status(500).send({ success: false, err })
    return res.status(200).send({
      success: true,
      count
    })
  });
});

// count all accepted audio
router.get("/audio", (req, res) => {
  // Audio.estimatedDocumentCount((err, count) => {
  //   if (err) res.status(500).send({ success: false, err })
  //   return res.status(200).send({
  //     success: true,
  //     count
  //   })
  // })
  Chatroom.find({}, (err, allRoom) => {
    if (err) res.status(500).send({ success: false, err })
    let count = 0;
    allRoom.map(room => {
      console.log(`Room ${room.name}: ${room.audioList.length}`);
      return count = count + room.audioList.length;
    })
    return res.status(200).send({
      success: true,
      count
    })
  })
})

router.get("/flatten", (req, res) => {
  Chatroom.findOne()
  .skip(1)
  .populate('currentIntent')
  .exec((err, roomFound) => {
    if (err) res.status(500).send({ success: false, err })
    const result = flattenIntent(roomFound.currentIntent);
    return res.status(200).send({
      success: true,
      result,
    })
  });
})

// count main intent for rooms

const flattenIntent = (currentIntent) => {
  const { intent, loan_purpose, loan_type, card_type, card_usage, digital_bank, card_activation_type, district, city, name, cmnd, four_last_digits, generic_intent } = currentIntent;
  return `${intent}_${loan_purpose}_${loan_type}_${card_type}_${card_usage}_${digital_bank}_${card_activation_type}_${district}_${city}_${name}_${cmnd}_${four_last_digits}_${generic_intent}`;
}

module.exports = router;