const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Chatroom } = require("../models/Chatroom");
// const { Audio } = require("../models/Audio");
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

// Count room done.
// Count room undone.
// Count approved audios with intent.
// Count intents distribution. 
router.get("/statistic", async (req, res) => {
  let roomDoneCount = 0;
  let roomNotDoneCount = 0;
  let audioCount = 0;
  let intentCount = {};
  for (let i = 0; i < intentSamplePool.INTENT.length; i++) intentCount[intentSamplePool.INTENT[i].name] = 0;
  for (let i = 0; i < intentSamplePool.GENERIC_INTENT.length; i++) intentCount[intentSamplePool.GENERIC_INTENT[i]] = 0;
  const roomList = await Chatroom.find({}).populate({
    path: 'audioList',
    populate: {
      path: 'intent',
    }
  });

  for (let roomIndex = 0; roomIndex < roomList.length; roomIndex++) {
    
    const { audioList, done } = roomList[roomIndex];
    if (done) roomDoneCount++;
    else roomNotDoneCount++;
    // audioCount = audioCount + audioList.length;
    for (let audioIndex = 0; audioIndex < audioList.length; audioIndex++) {
      const { intent, generic_intent } = audioList[audioIndex].intent;
      let count = 0;
      if (intent !== null) {
        count++;
        intentCount[intentSamplePool.INTENT[intent].name]++;
      }
      if (generic_intent !== null) {
        count++
        intentCount[intentSamplePool.GENERIC_INTENT[generic_intent]]++;
      }
      if (count !== 0) audioCount++;
    }
  }
  res.status(200).send({
    success: true,
    roomDoneCount, roomNotDoneCount, audioCount, intentCount
  })
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

router.get("/export-user", async (req, res) => {
  const { destination } = req.body;

  await User.find()
  .then((userFound) => {
    exportObject(destination, userFound)
  })
  .catch(err => {
    res.status(500).send("Internal problem... Can't get User's information. Err:");
    throw err
  });

  res.status(200).send("Ok");
})

// count main intent for rooms
router.get("/export-conversation", async (req, res) => {
  const { destination } = req.body;
  
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
  rooms.forEach((room) => {
    let conversation = {};
    conversation.id = room.name;
    conversation.turns = [];
    const { audioList } = room;

    if (audioList.length > 0) {
      audioList.forEach((audio, audioIndex) => {
        const frames = {};
        const { prevIntent, user, intent, transcript, link } = audio;
        
        frames.path = link;
        frames.prevIntent = prevIntent;
        frames.speaker = user;
        frames.turn_id = audioIndex;
        frames.transcript = transcript;
        frames.active_intent = 
          intent["intent"] !== null ? intentSamplePool["INTENT"][intent["intent"]].name :
          intent["generic_intent"] !== null ? intentSamplePool["GENERIC_INTENT"][intent["generic_intent"]] : ""
        frames.slot_values = {};

        const properties = ["loan_purpose", "loan_type", "card_type", "card_usage", "digital_bank", "card_activation_type", "district", "city", "name", "cmnd", "four_last_digits"];
        for (let key in properties) {
          if(intent[properties[key]] !== null) {
            const slot = properties[key];
            
            switch(slot) {
              case "city":
              case "district":
                frames.slot_values[slot] = intent[slot];
                break;
              default:
                if (intentSamplePool[slot.toUpperCase()] === undefined || intent[slot] === -1) {
                  frames.slot_values[slot] = intent[slot];
                } else {
                  if (intentSamplePool[slot.toUpperCase()][intent[slot]] !== undefined) { // normally
                    frames.slot_values[slot] = intentSamplePool[slot.toUpperCase()][intent[slot]].name;
                  } else { // probably forgot that the intent file has been changed, need to recover the old version for this to be recorded correctly.
                    res.status(500).send("You probably forgot that the intent file in the config folder has been changed, need to recover the old version for this to be recorded correctly.")
                  }
                }
            }
          }
        }

        conversation.turns.push(frames);
      })
    }
    result.push(conversation);
  })
  exportObject(destination, result);
  res.status(200).send("ok!");
})

router.get("/test", (req, res) => {
  res.status(200).send("oke!")
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

// const getLabel = (slot) => {
//   const slotIndex = intentSamplePool.SLOT_LABEL.findIndex((item) => {
//     return item.tag.toUpperCase() === slot.toUpperCase();
//   });

//   return slotIndex === -1 ? '' : intentSamplePool.SLOT_LABEL[slotIndex].name;
// };

module.exports = router;