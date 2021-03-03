const express = require('express');
const router = express.Router();
const { Audio } = require("../models/Audio");

router.put("/:audioID", (req, res) => {

  const audioID = req.params.audioID;
  const { transcript } = req.body;
  Audio.findById(audioID)
  .then(audioFound => {
    
    if(!audioFound) {
      console.log("Can't read transcript file! ",err);
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
  // console.log("Received transcript for audio " + audioID + " " + transcript);
  // res.status(200).send({success: true});
  // res.status(404)
})

module.exports = router;