const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const { awsAccessKeyId, awsSecretAccessKey, awsSessionToken, awsBucketName, awsRegion } = require('./../config/aws');
const mongoose = require("mongoose");

// Generate random ID
function uuidv4() {
  return mongoose.Types.ObjectId();
}

AWS.config.update({region: awsRegion});

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
    sessionToken: awsSessionToken,
  }
})

const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
    callback(null, '')
  }
})

const upload = multer({ storage }).single('soundBlob');

// save those blob to the server
router.post('/', upload, (req, res) => {

  let myFile = req.file.originalname.split(".")
  const fileType = myFile[myFile.length - 1]

  const params = {
    Bucket: awsBucketName, 
    Key: `${uuidv4()}.${fileType}`,
    Body: req.file.buffer,
  }

  const userID = req.body.userID;
  const roomID = req.body.roomID;

  s3.upload(params, async (err, data) => {
    if (err) throw err
    // console.log(`File uploaded successfully at ${data.Location}`)

    // save the audio information 
    const audioID = await saveAudioMongo(userID, data.Location)
    err = updateRoomInfo(roomID, audioID)
    if (err) {
      res.status(500).send(err)
      throw err 
    }

    res.status(200).send({data, audioID: audioID})
  })
})

const { Audio } = require("./../models/Audio");
const { Chatroom } = require("./../models/Chatroom");

const saveAudioMongo = async (userID, link) => {

  const audio = await Audio.create({
    user: userID,
    link: link,
    intent: null,
  })

  return audio._id
}

const updateRoomInfo = (roomID, audioID) => {
  
  Chatroom.findById(roomID)
  .then(roomFound => {
    if(!roomFound) {
      console.log("Room not found!!!")
      // IMPLEMENT ERROR HANDLING HERE!!
      return "Room not found!"
    } else {
      roomFound.audioList.push(audioID);
      return roomFound.save();
    }
  })
  .then((err, roomFound) => {
    // console.log(`Room ${roomUpdated.name} updated audio information successfully!`)
    if (err) return err
    return null
  })
  .catch(err => {
    console.log("Unable to update audio information to room")
    console.log(err)
    return err
  });
}

module.exports = router;