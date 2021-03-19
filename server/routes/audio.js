const express = require('express');
const router = express.Router();
const { Audio } = require("../models/Audio");

const tmp = require("tmp");
const fs = require("fs");
const request = require('request');
const { exec } = require('child_process');

router.post("/", (req, res) => {

  const { userID, link } = req.body;

  Audio.create({
    user: userID,
    link: link,
    intent: null,
    revertable: false,
    transcript: " ",
    fixBy: null,
  }).then(audioCreated => {
    if (!audioCreated) {
      res.status(500).send({ success: false, error: "Can't save audio information to the db!"});
    } else {
      return res.status(201).send({
        audioID: audioCreated._id
      });
    }
  });
})

router.put("/transcript", (req, res) => {
  const { audioLink, audioID } = req.body;
  
  getTranscript(audioLink, audioID);

  res.status(200).send("")
})

router.put("/:audioID", (req, res) => {

  const audioID = req.params.audioID;
  const { transcript } = req.body;
  Audio.findById(audioID)
  .then(audioFound => {
    
    if(!audioFound) {
      console.log("Can't find audio for transcript!");
      res.status(404).send({ success: false, message: "Audio not found" });
      throw "Can't find audio"
    } else {
      audioFound.transcript = transcript;
      return audioFound.save();
    }
  })
  .then(audioUpdated => res.status(200).send({ success: true, audioUpdated }))
  .catch(err => {
    console.log(`Error while updating audio ${audioID} transcript... ${err}`)
    res.status(500).send({success: false, message: "Something's wrong internally, so sorry..."})
  })
})

let download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    if (err) throw "Something's wrong while uploading audio uri..."
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

router.put("/:audioID/:userID", (req, res) => {

  const audioID = req.params.audioID;
  const userID = req.params.userID;
  const { transcript } = req.body;
  Audio.findById(audioID)
  .then(audioFound => {
    
    if(!audioFound) {
      console.log("Can't find audio to update transcript!");
      res.status(404).send({ success: false, message: "Audio not found" });
      throw "Can't find audio"
    } else {
      audioFound.transcript = transcript;
      audioFound.fixBy = userID;
      return audioFound.save();
    }
  })
  .then(audioUpdated => res.status(200).send({ success: true, audioUpdated }))
  .catch(err => {
    console.log(`Error while updating audio ${audioID} transcript... ${err}`)
    res.status(500).send({success: false, message: "Something's wrong internally, so sorry..."})
  })
  // console.log("Received transcript for audio " + audioID + " " + transcript);
  // res.status(200).send({success: true});
  // res.status(404)
})

const getTranscript = (uri, audioID) => {

  tmp.file(function _tempFileCreated (err, path, fd, cleanupCallback) {
    if (err) throw err;
    download(uri, path , function(){
      exec(
        `python ./server/routes/audio_transcript/main.py ${path}`,
        (err, stdout, stderr) => {
          if (err) {
            console.error(`exec error: ${err}`);
            return "";
          }
          
          Audio.findById(audioID)
          .then(audioFound => {
            if(!audioFound) {
              console.log("Can't find audio for transcript!");
              return null
            } else {
              audioFound.transcript = stdout;
              return audioFound.save();
            }
          })
          .then(audioUpdated => {})
          .catch(err => {
            console.log(`Error while updating audio ${audioID} transcript... ${err}`)
          })
        }
      )
    });

    cleanupCallback();
  })
}

module.exports = router;