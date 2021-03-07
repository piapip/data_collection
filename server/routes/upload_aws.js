const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const FileType = require('file-type');
const AWS = require('aws-sdk');
const config = require("./../config/key");
const { exec } = require('child_process');
var fs = require('fs');
const toWav = require('audiobuffer-to-wav');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const AudioContext = require('web-audio-api').AudioContext;
const audioContext = new AudioContext;
const mongoose = require("mongoose");

// const tempTranscriptFile = './server/tmp/transcript.txt';
const tempFolder = './server/tmp';

AWS.config.update({region: config.awsRegion});

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
    sessionToken: config.awsSessionToken,
  }
})

const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
    callback(null, '')
  }
})

const upload = multer({ storage }).single('soundBlob');

// save those blob to the server
router.post('/', upload, async (req, res) => {

  // get the soundData and relevant data
  const soundData = req.file.buffer;
  let myFile = req.file.originalname.split(".");
  const key = uuidv4();
  const fileType = myFile[myFile.length - 1];
  const filename = req.file.originalname.replace(`.${fileType}`, "") + `_${key}`;
  const userID = req.body.userID;
  const roomID = req.body.roomID;  

  // RENAME THESE SHIT
  const tempWavFile = `${tempFolder}/tmp_${key}.wav`;
  const tempMonoFile = `${tempFolder}/anothertmp_${key}.wav`;
  
  
  // check it if it's wap or mp3
  let tempFileType = (await FileType.fromBuffer(soundData)).ext;
  // console.log(`tempfile: ${tempFileType}`);

  if (tempFileType !== "mp3" && tempFileType !== "wav") {
    return res.status(500).send(`Can't handle ${tempFileType} type`)
  }

  // if it's mp3, convert mp3 buffer to wav, store that file in ./server/tmp/tmp.wav
  if (tempFileType === "mp3") {
    await convertBufferToWav(soundData, tempWavFile);
  } else {
    // otherwise, save it
    fs.appendFile(tempWavFile, soundData, (err) => {
      if (err) {
        console.log("Can't save wav file ", err);
      }
    })
  }
  
  // convert wav to 48kHz mono channel file, store that file in ./server/tmp/anothertmp.wav
  convertToMonoChannel(tempWavFile, tempMonoFile, () => {
    // downsampling to 16kHz
    // downsample(tempMonoFile);
    // if(!fs.existsSync(tempMonoFile)) {
    //   // return res.status(500).send("Can't convert to mono channel fast enough! So sorry!");
    //   throw "Can't convert to wav file fast enough! So sorry!"
    // }
    downsample(tempMonoFile, () => {
      // upload to aws
      const fileContent = fs.readFileSync(tempMonoFile);
  
      const params = {
        Bucket: config.awsBucketName, 
        Key: `${filename}.wav`,
        // Key: req.file.originalname,
        Body: fileContent,
      }
  
      s3.upload(params, async (err, data) => {
        if (err) throw err
        
        // const audioID = await saveAudioMongo(userID, data.Location, tempTranscript)
        const audioID = await saveAudioMongo(userID, data.Location)
        err = updateRoomInfo(roomID, audioID)
        if (err) {
          res.status(500).send(err)
          throw err 
        }
  
        // DON'T DO THIS HERE!!!!
        // then delete all file in tmp so they won't trash the server.
        // deleteAllFiles('./server/tmp');
  
  
        res.status(200).send({data, audioID: audioID, key: key})
      })
    });
  });

  // ====================================================================================================
  
  // extract the trascript (read it from the file) (something's wrong with the code, can exec test.wav, can run python with pushed audio but can't exec pushed audio)
  // getTranscript(tempMonoFile, tempTranscriptFile);
  
  // res.status(200).send("ok")

})

const { Audio } = require("./../models/Audio");
const { Chatroom } = require("./../models/Chatroom");

// const saveAudioMongo = async (userID, link, transcript) => {
const saveAudioMongo = async (userID, link) => {

  const audio = await Audio.create({
    user: userID,
    link: link,
    intent: null,
    revertable: false,
    // transcript: transcript,
    transcript: " ",
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
  .then((roomUpdated) => {
    // console.log(`Room ${roomUpdated.name} updated audio information successfully!`)
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

// convert mp3 buffer to wav
const convertBufferToWav = (audioData, dest) => {
  // make it wav
  audioContext.decodeAudioData(audioData, buffer => {
    let wav = toWav(buffer); 
    var chunk = new Uint8Array(wav);
    // console.log(chunk); 
    fs.appendFile(dest, Buffer.from(chunk), function (err) {
      if (err) {
        console.log("Can't convert buffer to wav ", err);
      }
    });
  })
}

// const deleteAllFiles = (folder) => {
//   fs.readdir(folder, (err, files) => {
//     if (err) console.log(err);
//     for (const file of files) {
//       fs.unlink(path.join(folder, file), err => {
//         if (err) console.log(err);
//       });
//     }
//   });
// }

// convert file wav to 48kHz mono channel
// cb is to down sample it to 16kHz
const convertToMonoChannel = (originalFile, dest, cb) => {
  // make it mono
  if(fs.existsSync(originalFile)) {
    ffmpeg(originalFile)
    .addOption('-ac', 1)
    .on('end', () => {
      // console.log('Processing finished!');
      if(cb) cb();
    })
    .save(dest);
  } else {
    setTimeout(() => { 
      if(fs.existsSync(originalFile)) {
        ffmpeg(originalFile)
        .addOption('-ac', 1)
        .on('end', () => {
          // console.log('Processing finished!');
          if(cb) cb();
        })
        .save(dest);
      } else {
        fs.copyFile(originalFile, dest, (err) => {
          if (err) throw err;
          console.log(`${originalFile} was copied to ${dest}`);
        })
      }
    }, 500);
  }
  
}

// downsample to 16kHz
// all done, cb is now waiting for uploading to the server
const downsample = (originalFile, cb) => {
  exec(
    `python ./server/routes/audio_transcript/downsample.py ${originalFile}`,
    (err) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
    }
  )
  .on('exit', () => {
    if(cb) cb()
  })
}

// const getTranscript = async (audioFile, dest) => {

//   // console.log(`Here's the command: python ./server/routes/audio_transcript/main.py ${audioFile} ${dest}`)
//   await exec(
//     `python ./server/routes/audio_transcript/main.py ${audioFile} ${dest}`,
//     // `python ./server/routes/audio_transcript/main.py ./server/routes/audio_transcript/test.wav ${dest}`,
//     (err, stdout, stderr) => {
//       if (err) {
//         console.error(`transcript error: ${err}`);
//         return;
//       }

//       if (stdout !== "") console.log(`stdout: ${stdout}`);
//       if (stderr !== "") console.log(`stderr: ${stderr}`);
//     }
//   )
//     // .on('exit', () => {
//     //   const transcript = fs.readFileSync(tempTranscriptFile);
//     //   console.log(`Transcript: ${transcript}`);
//     //   return transcript;
//     // });
// }

// const download = function(url, dest, cb) {
//   var file = fs.createWriteStream(dest);
//   // var request = 
//   https.get(url, function(response) {
//     response.pipe(file);
//     file.on('finish', function() {
//       file.close(cb);  // close() is async, call cb after close completes.
//     });
//   }).on('error', function(err) { // Handle errors
//     fs.unlink(dest); // Delete the file async. (But we don't check the result)
//     if (cb) cb(err.message);
//   });
// };

// const mongoose = require("mongoose");

// Generate random ID
function uuidv4() {
  return mongoose.Types.ObjectId();
}

module.exports = router;