const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const FileType = require('file-type');
const AWS = require('aws-sdk');
const { awsAccessKeyId, awsSecretAccessKey, awsSessionToken, awsBucketName, awsRegion } = require('./../config/aws');
const { exec, spawn } = require('child_process');
var https = require('https');
var fs = require('fs');
const toWav = require('audiobuffer-to-wav');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const AudioContext = require('web-audio-api').AudioContext;
const audioContext = new AudioContext;

const tempWavFile = './server/tmp/tmp.wav';
const tempMonoFile = './server/tmp/anothertmp.wav';
const tempTranscriptFile = './server/tmp/transcript.txt';

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
router.post('/', upload, async (req, res) => {

  // get the soundData 
  const soundData = req.file.buffer;
  
  // check it if it's wap or mp3
  let tempFileType = (await FileType.fromBuffer(soundData)).ext;
  // console.log(`tempfile: ${tempFileType}`);

  if (tempFileType !== "mp3" && tempFileType !== "wav") {
    return res.status(500).send(`Can't handle ${tempFileType} type`)
  }

  // if it's mp3, convert mp3 buffer to wav, store that file in ./server/tmp/tmp.wav
  if (tempFileType === "mp3") {
    convertBufferToWav(soundData, tempWavFile);
  } else {
    // otherwise, save it
    fs.appendFile(tempWavFile, soundData, (err) => {
      if (err) {
        console.log("Can't save wav file ", err);
      }
    })
  }
  
  // convert wav to 48kHz mono channel file, store that file in ./server/tmp/anothertmp.wav
  convertToMonoChannel(tempWavFile, tempMonoFile);
  
  // downsampling to 16kHz
  // downsample(tempMonoFile);
  downsample(tempMonoFile, () => {
    // upload to aws
    const fileContent = fs.readFileSync(tempMonoFile);
    const userID = req.body.userID;
    const roomID = req.body.roomID;

    const params = {
      Bucket: awsBucketName, 
      Key: `${userID}_${roomID}.wav`,
      Key: req.file.originalname,
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

      // fs.rmdir('./server/tmp', { recursive: true });
      // fs.rmdirSync('./server/tmp', { recursive: true });
      deleteAllFiles('./server/tmp');


      res.status(200).send({data, audioID: audioID})
    })
  });
  
  // // extract the trascript (read it from the file) (something's wrong with the code, can exec test.wav, can run python with pushed audio but can't exec pushed audio)
  // await getTranscript(tempMonoFile, tempTranscriptFile);
  
  // res.status(200).send("ok")

  // // upload to aws
  // const fileContent = fs.readFileSync(tempMonoFile);
  // const userID = req.body.userID;
  // const roomID = req.body.roomID;

  // const params = {
  //   Bucket: awsBucketName, 
  //   Key: `${userID}_${roomID}.wav`,
  //   Key: req.file.originalname,
  //   Body: fileContent,
  // }

  // s3.upload(params, async (err, data) => {
  //   if (err) throw err
    
  //   // const audioID = await saveAudioMongo(userID, data.Location, tempTranscript)
  //   const audioID = await saveAudioMongo(userID, data.Location)
  //   err = updateRoomInfo(roomID, audioID)
  //   if (err) {
  //     res.status(500).send(err)
  //     throw err 
  //   }

  //   res.status(200).send({data, audioID: audioID})
  // })

  // ====================================================================================================================================

  // let myFile = req.file.originalname.split(".");
  // const sentFileType = myFile[myFile.length - 1];
  // const fileName = req.file.originalname.replace("."+sentFileType, "");

  // console.log(`fileName: ${fileName}`)

  // const params = {
  //   Bucket: awsBucketName, 
  //   Key: `${fileName}.${sentFileType}`,
  //   // Key: req.file.originalname,
  //   Body: req.file.buffer,
  // }

  // const userID = req.body.userID;
  // const roomID = req.body.roomID;

  // s3.upload(params, async (err, data) => {
  //   if (err) throw err
  //   // console.log(`File uploaded successfully at ${data.Location}`)
    
  //   // // get the transcript for the audio
  //   // const path = "./server/routes/audio_transcript";
  //   // let tempTranscript = "";
  //   // download(data.Location, path+"/tmp.wav", () => {
  //   //   const { transcript, error } = getTranscript(path+"/main.py", path+"/tmp.wav")
  //   //   if (error) {
  //   //     res.status(500).send(err)
  //   //     return
  //   //   }

  //   //   else tempTranscript = transcript;
  //   // })

  //   // save the audio information 
  //   // const audioID = await saveAudioMongo(userID, data.Location, tempTranscript)
  //   const audioID = await saveAudioMongo(userID, data.Location)
  //   err = updateRoomInfo(roomID, audioID)
  //   if (err) {
  //     res.status(500).send(err)
  //     throw err 
  //   }

  //   res.status(200).send({data, audioID: audioID})
  // })
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

    // (async () => {
    //   console.log("After: ")
    //   // console.log(await FileType.fromFile(dest));
    //   console.log(await FileType.fromFile(dest));
    // })();
  })
}

const deleteAllFiles = (folder) => {
  fs.readdir(folder, (err, files) => {
    if (err) console.log(err);
    for (const file of files) {
      fs.unlink(path.join(folder, file), err => {
        if (err) console.log(err);
      });
    }
  });
}

// convert file wav to 48kHz mono channel
const convertToMonoChannel = (originalFile, dest) => {
  // make it mono
  ffmpeg(originalFile)
  .addOption('-ac', 1)
  // .on('progress', (progress) => {
  //   // console.log(JSON.stringify(progress));
  //   console.log('Processing: ' + progress.targetSize + ' KB converted');
  // })
  // .on('end', () => {
  //   console.log('Processing finished !');
  // })
  .save(dest);
}

// downsample to 16kHz
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

const getTranscript = async (audioFile, dest) => {

  // console.log(`Here's the command: python ./server/routes/audio_transcript/main.py ${audioFile} ${dest}`)
  await exec(
    `python ./server/routes/audio_transcript/main.py ${audioFile} ${dest}`,
    // `python ./server/routes/audio_transcript/main.py ./server/routes/audio_transcript/test.wav ${dest}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`transcript error: ${err}`);
        return;
      }

      if (stdout !== "") console.log(`stdout: ${stdout}`);
      if (stderr !== "") console.log(`stderr: ${stderr}`);
    }
  )
    .on('exit', () => {
      const transcript = fs.readFileSync(tempTranscriptFile);
      console.log(`Transcript: ${transcript}`);
      return transcript;
    });
}

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

// var downsampleBuffer = function (buffer, sampleRate, outSampleRate) {
//   if (outSampleRate == sampleRate) {
//     return buffer;
//   }
//   if (outSampleRate > sampleRate) {
//     throw "downsampling rate show be smaller than original sample rate";
//   }
//   var sampleRateRatio = sampleRate / outSampleRate;
//   var newLength = Math.round(buffer.length / sampleRateRatio);
//   var result = new Int16Array(newLength);
//   var result = [];
//   var offsetResult = 0;
//   var offsetBuffer = 0;
//   while (offsetResult < result.length) {
//     var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
//     var accum = 0, count = 0;
//     for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
//       accum += buffer[i];
//       count++;
//     }

//     result[offsetResult] = Math.min(1, accum / count)*0x7FFF;
//     offsetResult++;
//     offsetBuffer = nextOffsetBuffer;
//   }
//   return result.buffer;
// }

// function downsampleBuffer(buffer) {
//   // if (rate == sampleRate) {
//   //   return buffer;
//   // }
//   // if (rate > sampleRate) {
//   //   throw "downsampling rate show be smaller than original sample rate";
//   // }
//   // var sampleRateRatio = sampleRate / rate;
//   var sampleRateRatio = 3;
//   var newLength = Math.round(buffer.length / sampleRateRatio);
//   var result = new Float32Array(newLength);
//   var offsetResult = 0;
//   var offsetBuffer = 0;
//   while (offsetResult < result.length) {
//     var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
//       // Use average value of skipped samples
//     var accum = 0, count = 0;
//     for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
//         accum += buffer[i];
//         count++;
//     }
//     result[offsetResult] = accum / count;
//     // Or you can simply get rid of the skipped samples:
//     // result[offsetResult] = buffer[nextOffsetBuffer];
//     offsetResult++;
//     offsetBuffer = nextOffsetBuffer;
//   }
//   return result;
// }

// const convertMP3ToWAV = (path) => {
//   ffmpeg(path)
//   .toFormat('wav')
//   .on('error', (err) => {
//     console.log('An error occurred: ' + err.message);
//   })
//   .on('progress', (progress) => {
//     // console.log(JSON.stringify(progress));
//     console.log('Processing: ' + progress.targetSize + ' KB converted');
//   })
//   .on('end', () => {
//     console.log('Processing finished !');
//   })
//   .save('./anothertmp.wav');

//   (async () => {
//     console.log(await FileType.fromFile("./anothertmp.wav"));
//   })();
// }

// const mongoose = require("mongoose");

// Generate random ID
// function uuidv4() {
//   return mongoose.Types.ObjectId();
// }

module.exports = router;