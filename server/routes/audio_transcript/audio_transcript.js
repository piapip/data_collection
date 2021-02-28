const express = require('express');
const { spawn, exec } = require('child_process');
const wavFileInfo = require('wav-file-info');

const router = express.Router();
// const tmp = require('tmp');
var https = require('https');
var fs = require('fs');

const download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  // var request = 
  https.get(url, function(response) {
    response.pipe(file);

    cb();
    file.on('finish', function() {
      file.close(() => {
        console.log("Close!")
      });  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) {
      console.error("Can't get file. Probably fail to download it.")
    };
  }).on('close', () => {
    fs.unlink(dest, () => {
      console.log("Terminated!")
    });
  });
};

const getTranscript = (mainFile, audioFile) => {
  let transcript = "";
  let error = "";
  exec(
    `python ${mainFile} ${audioFile}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
      
      transcript = stdout;
      error = stderr;
    }
  );

  return {
    transcript: transcript,
    error: error === "" ? null : error,
  }
}

const checkFileType = (path) => {
  wavFileInfo.infoByFilename(path, (err, info) => {
    if (err) throw err;
    console.log(info);
  })
}

router.get("/", async (req, res) => {
  
  const url = "https://end-to-end-slu.s3.amazonaws.com/603a8c0bea71d74090e0c596_5ff6de72e5181b29201d56b6_1.wav";
  const path = "./server/routes/audio_transcript";

  // let tempTranscript = "";
  // download(url, path+"/tmp.wav", () => {
  //   const { transcript, error } = getTranscript(path+"/main.py", path+"/tmp.wav")
  //   if (error) {
  //     res.status(500).send(err)
  //     return
  //   }

  //   tempTranscript = transcript;
  // })

  // console.log(tempTranscript);

  checkFileType(path+'/tmp.wav')

  // download(url, path, () => {
  //   exec(
  //     'python ./server/routes/audio_transcript/main.py ./server/routes/audio_transcript/test.wav',
  //     (err, stdout, stderr) =>{
  //     if (err) {
  //       console.error(`exec error: ${err}`);
  //       return;
  //     }

  //     console.log(`stdout: ${stdout === null}`);
  //     console.error(`stderr: ${stderr === ""}`);
  //   })
  // })

  // console.log("Testing");
  // let dataToSend;
  // let err;
  // let largeDataSet = []
  // spawn new child process to call the python script
  // const python = await spawn('python', 
  //   [
  //     './server/routes/audio_transcript/main.py', 
  //     './server/routes/audio_transcript/test.wav',
  //   ]);

  // console.log(python.stdout)

  // exec(
  //   'python ./server/routes/audio_transcript/main.py ./server/routes/audio_transcript/test.wav',
  //   (err, stdout, stderr) =>{
  //   if (err) {
  //     console.error(`exec error: ${err}`);
  //     return;
  //   }

  //   dataToSend = stdout;
  //   err = stderr;
  //   console.log(`stdout: ${stdout}`);
  //   console.error(`stderr: ${stderr}`);

  // })



  // python.stdout.on('data', function (data) {
  //   console.log(`stdout: ${data}`);
  //   // largeDataSet.push(data);
  //   dataToSend =  data;
  // });

  // python.on('error', () => {
  //   console.error("Can't execute audio transcription procress...")
  // })

  // python.on('close', (code) => {
  //   console.log(`child process close all stdio with code ${code}`)
  //   // send data to browser
  //   return res.status(200).send(largeDataSet.join(''))
  //   // res.status(200).send({success: true, data: dataToSend});
  // })

  return res.status(200).send({
    success: true,
    data: tempTranscript,
    // error: err
  });
})

module.exports = router;