const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Chatroom } = require("../models/Chatroom");
const { Audio } = require("../models/Audio");
const fs = require("fs");
const intentSamplePool = require("./../config/intent");

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
router.get("/export", async (req, res) => {
  const exportFolder = `C:/Users/thovi/Desktop/Data/data_collection/export`;
  const userExportFile = "/User.json";
  const conversationsExportFile = "/Conversations.json";
  
  await User.find()
  .then((userFound) => {
    exportObject(exportFolder + userExportFile, userFound)
  })
  .catch(err => {
    res.status(500).send("Internal problem... Can't get User's information. Err:");
    throw err
  });

  const rooms = await Chatroom
  .find()
  .populate({
    path: 'audioList',
    populate: {
      path: 'intent',
    }
  })
  .exec();
  let result = [];
  rooms.forEach((room, roomIndex) => {
    let conversation = {};
    conversation.id = room.name;
    conversation.turns = [];
    const { audioList } = room;

    if (audioList.length > 0) {
      audioList.forEach((audio, audioIndex) => {
        const frames = {};
        const { prevIntent, user, intent, transcript, link } = audio;
        const properties = ["intent", "loan_purpose", "loan_type", "card_type", "card_usage", "digital_bank", "card_activation_type", "district", "city", "name", "cmnd", "four_last_digits", "generic_intent"];
        
        frames.path = link;
        frames.prevIntent = prevIntent;
        frames.speaker = user;
        frames.turn_id = audioIndex;
        frames.transcript = transcript;
        frames.slot_values = {};
        frames.semantics = '';

        for (let key in properties) {
          if(intent[properties[key]] !== null) {
            const slot = properties[key];
            frames.slot_values[slot] = intent[slot];
            if (intentSamplePool[slot.toUpperCase] === undefined) {
              frames.semantics = frames.semantics + `'${slot}': '${intent[slot]}', `
            } else {
              frames.semantics = frames.semantics + `'${slot}': ${intentInfo[slot.toUpperCase][intent[slot]]}, `
            }
            
          }
        }
        frames.semantics = "{" + frames.semantics.substring(0, frames.semantics.length - 2) + "}";
        conversation.turns.push(frames);
      })
    }
    result.push(conversation);
  })
  exportObject(exportFolder + conversationsExportFile, result);
  res.status(200).send("ok!");
})

const exportObject = (destination, object) => {
  fs.writeFile(destination, JSON.stringify(object), (err) => {
    // return doesn't work...
    if (err) {
      console.log(err)
    }
  })
}

const flattenIntent = (currentIntent) => {
  const { intent, loan_purpose, loan_type, card_type, card_usage, digital_bank, card_activation_type, district, city, name, cmnd, four_last_digits, generic_intent } = currentIntent;
  return `${intent}_${loan_purpose}_${loan_type}_${card_type}_${card_usage}_${digital_bank}_${card_activation_type}_${district}_${city}_${name}_${cmnd}_${four_last_digits}_${generic_intent}`;
}

module.exports = router;