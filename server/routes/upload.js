const express = require('express');
const router = express.Router();
const uploadService = require('../services/upload');
const multer = require('multer');
// const tmp = require("tmp");
// const fs = require("fs");
// const request = require('request');
// const { exec } = require('child_process');

const DOMAIN_NAME = 'http://localhost:5000';

const upload_local = uploadService.upload.single('soundBlob');

router.post('/file', (req, res) => {
  upload_local(req, res, async err => {
    if (err) {
      if (err instanceof multer.MulterError) {
        let error;
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            error = new Error("Exceed file limit size");
            res.status(406).send({ success: false, error});
          default:
            error = new Error("Can't upload the file\n");
            res.status(500).send({ success: false, error});
        }
      } else if (!(err instanceof multer.MulterError)) {
        console.log("Got here!!!!")
        res.status(500).send({ success: false, err })
      }
    }

    const userID = req.body.userID;
    const roomID = req.body.roomID;

    try {
      let path_components = req.file.path.split('\\')
      console.log(req.file.path)
      let audio_link = `${DOMAIN_NAME}/${path_components[path_components.length-3]}/${path_components[path_components.length-2]}/${path_components[path_components.length-1]}`
      console.log(`Link: ${audio_link}`)

      // save the audio information 
      const audioID = await saveAudioMongo(userID, audio_link)
      err = updateRoomInfo(roomID, audioID)
      if (err) {
        res.status(500).send(err)
        throw err 
      }
  
      return res.status(200).send({ success: true, link: audio_link, audioID: audioID });
    } catch (error) {
      console.log("Dead")
      res.status(500).send({ success: false, error })
    }
  })
})

const { Audio } = require("./../models/Audio");
const { Chatroom } = require("./../models/Chatroom");

const saveAudioMongo = async (userID, link) => {

  const audio = await Audio.create({
    user: userID,
    link: link,
    intent: null,
    revertable: false,
    transcript: " ",
    fixBy: null,
  })

  // getTranscript(link, audio._id)

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
  .then((roomUpdated) => {
    if (!roomUpdated) { 
      console.log("Can't update room information after upload audio!!!")
      return
    }
  })
  .catch(err => {
    console.log("Unable to update audio information to room")
    console.log(err)
    return err
  });
}

// let download = function(uri, filename, callback){
//   request.head(uri, function(err, res, body){
//     if (err) throw "Something's wrong while uploading audio uri..."
//     // console.log('content-type:', res.headers['content-type']);
//     // console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//   });
// };

// const getTranscript = (uri, audioID) => {

//   tmp.file(function _tempFileCreated (err, path, fd, cleanupCallback) {
//     if (err) throw err;
//     download(uri, path , function(){
//       exec(
//         `python ./server/routes/audio_transcript/main.py ${path}`,
//         (err, stdout, stderr) => {
//           if (err) {
//             console.error(`exec error: ${err}`);
//             return "";
//           }
          
//           Audio.findById(audioID)
//           .then(audioFound => {
//             if(!audioFound) {
//               console.log("Can't find audio for transcript!");
//               return null
//             } else {
//               audioFound.transcript = stdout;
//               return audioFound.save();
//             }
//           })
//           .then(audioUpdated => {})
//           .catch(err => {
//             console.log(`Error while updating audio ${audioID} transcript... ${err}`)
//           })
//         }
//       )
//     });

//     cleanupCallback();
//   })
// }

module.exports = router;