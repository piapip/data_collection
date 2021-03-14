const express = require('express');
const router = express.Router();
const { Chatroom } = require("../models/Chatroom");

// GET ALL
router.get("/", (req, res) => {

  Chatroom.find({})
    // .populate('user1') //not use this yet... populate will bring every information of 'user1' to the table, instead of just the id.
    .exec((err, roomFound) => {
      // .send() lets the browser automatically assign Content-Type 
      // whereas .json() specifies Content-Type as json type.
      if (err) res.status(500).send({ success: false, err })
      return res.status(200).send({
        success: true,
        roomFound
      })
    });
    
})

// GET RANDOM
router.get("/random/:userID", (req, res) => {

  const userID = req.params.userID

  // Get the count of all records
  Chatroom.countDocuments({
    $or: [
    {
      $and: [
        {done: 0},
        {$or: [
          {
            $and: [
              {user1: null},
              {client: userID},
            ]
          },
          {
            $and: [
              {user2: null},
              {servant: userID},
            ]
          }
        ]}
      ]
    },
    {
      $and: [
        {done: 0},
        {$or: [
          {
            $and: [
              {user1: null},
              {servant: {
                $ne: userID
              }}
            ]
          },
          {
            $and: [
              {user2: null},
              {client: {
                $ne: userID
              }}
            ]
          }
        ]},
      ]
    },
    ]
  }).exec((err, count) => {
    if (err) res.status(500).send({ success: false, message: "Can't estimate document count", err })
    // Get a random entry 
    var random = Math.floor(Math.random() * count)
    Chatroom.findOne({
      $or: [
        {
          $and: [
            {done: 0},
            {$or: [
              {
                $and: [
                  {user1: null},
                  {client: userID},
                ]
              },
              {
                $and: [
                  {user2: null},
                  {servant: userID},
                ]
              }
            ]}
          ]
        },
        {
          $and: [
            {done: 0},
            {$or: [
              {
                $and: [
                  {user1: null},
                  {servant: {
                    $ne: userID
                  }}
                ]
              },
              {
                $and: [
                  {user2: null},
                  {client: {
                    $ne: userID
                  }}
                ]
              }
            ]},
          ]
        },
        ]
    }).skip(random)
    // .populate('intent')
    .exec((err, roomFound) => {
      if (err) res.status(500).send({ success: false, message: "Can't proceed to find any room", err })
      return res.status(200).send({
        success: true,
        roomFound
      })
    })
  })
})

// GET ONE
router.get("/:roomID", (req, res) => {
  Chatroom.findById(req.params.roomID)
  .populate('intent')
  .populate('currentIntent')
  .populate({
    path: 'audioList',
    populate: {
      path: 'fixBy',
    }
  })
  .exec((err, roomFound) => {
    if (err) res.status(500).send({ success: false, err })
    else if (!roomFound) res.status(404).send({ success: false, message: "Room not found" })
    else res.status(200).send({ success: true, roomFound })
  })
})

// GET ALL AUDIOS OF ONE ROOM
router.get("/:roomID/history", (req, res) => {
  Chatroom.findById(req.params.roomID, (err, roomFound) => {
    let history = roomFound.audioList;
    if (err) res.status(500).send({ success: false, err })
    else if (!roomFound) res.status(404).send({ success: false, message: "Room not found" })
    else res.status(200).send({ success: true, history })
  })
})

// CREATE A ROOM
router.post("/", async (req, res) => {

  const { name, task, content_type } = req.body;

  const chatroom = new Chatroom({
    name,
    task,
    content_type,
  })

  chatroom.save((err, roomCreated) => {
    if (err) return res.json({ success: false, err});
    return res.status(201).json({
      success: true,
      roomCreated
    });
  });
})

// REMOVE AUDIO
router.put("/:roomID/:userRole", (req, res) => {
  const roomID = req.params.roomID;
  const userRole = req.params.userRole;
  Chatroom.findById(roomID)
  .then( async (roomFound) => {
    if (!roomFound) res.status(404).send({ success: false, message: "Room not found" });
    else {

      // check turn
      if (!((userRole === "client" && roomFound.turn === 1) || (userRole === "servant" && roomFound.turn === 2))) {
        res.status(409).send({ success: 0, message: "You have to wait for your turn!" });
        return
      } 

      // check if there's anything to delete
      if (roomFound.audioList.length === 0) {
        res.status(406).send({ success: -1, message: "There's nothing to delete!" });
        return
      }

      // remove the latest audio and get its ID (OPTIONAL: Log it to a file)
      // const latestAudioID = roomFound.audioList.pop();
      roomFound.audioList.pop();

      // LOG TO A FILE!!!
      
      // update turn
      if (roomFound.turn === 1) {
        roomFound.turn = 3;
      } else if (roomFound.turn === 2) {
        roomFound.turn = 1;
      } else {
        // If somehow they can bypass the "check turn" floodgate, it will lead to this message. How to prevent that though :/
        res.status(200).send({ success: 0, message: "How did you even do this...? Removing audio... Update room turn... " });
        return
      }

      return roomFound.save((err, roomUpdated) => {
        if (err) res.status(500).send({ success: -3, message: err});
        return res.status(200).send({ success: 1, message: 'Remove audio successfully!' });
      })
    }
  });
})

module.exports = router;