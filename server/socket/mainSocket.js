var sockets = {}
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Message } = require("./../models/Message");
const { Intent } = require("./../models/Intent");

const tempFolder = './server/tmp';
const TRANSCRIPT_FOLDER = './server/transcript';

// cb is to clean up all the file in the folder that contains dest
const getTranscript = async (audioFile, dest, key, cb) => {

  // console.log(`Here's the command: python ./server/routes/audio_transcript/main.py ${audioFile} ${dest}`)
  await exec(
    `python ./server/routes/audio_transcript/main.py ${audioFile} ${dest} ${key}`,
    // `python ./server/routes/audio_transcript/main.py ./server/routes/audio_transcript/test.wav ${dest}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`transcript error: ${err}`);
        return;
      }

      // if (stdout !== "") console.log(`stdout: ${stdout}`);
      // if (stderr !== "") console.log(`stderr: ${stderr}`);
    }
  )
  // .on('exit', () => {
  //   const transcript = fs.readFileSync(dest);
  //   console.log(`Transcript: ${transcript}`);
  //   return transcript;
  // });

  if (cb) cb();
}

sockets.init = function(server) {
  // socket.io setup
  const io = require('socket.io')(server, {cors: {origin: "http://localhost:3000"}});
  const jwt = require('jsonwebtoken');

  // socket logic go here
  io.use(async (socket, next) => {
    try {
      // Must be matched with the frontend.
      const token = socket.handshake.query.token;
      if (token !== "undefined") {
        await jwt.verify(token, 'secret', (err, decode) => {
          if (err) console.log(err)
          else {
            socket.userId = decode
            next()
          }
        });
      }
    } catch (err) {
      console.log(err)
    }
  })
  let audioQueue = [];    // ready for audio room
  let textQueue = [];     // ready for text room
  let promptQueue = [];   // ready to join room
  // ^^^^^ server socket

  // vvvvv client socket
  io.on('connection', (socket) => {
    // console.log("Connected: " + socket.id);

    socket.on('disconnect', () => {
      // console.log("Disconnected: " + socket.id)
      var index = audioQueue.findIndex(item => item.socketID === socket.id)
      if (index !== -1) {
        audioQueue.splice(index, 1);
      } else {
        index = textQueue.findIndex(item => item.socketID === socket.id)
        if (index !== -1) {
          textQueue.splice(index, 1);
        }
      }
    });

    // when receive ready signal from user
    socket.on('ready', ({ socketID, userID, username, inputType }) => {
      let userInfo = {
        socketID: socketID,
        userID: userID,
        username: username,
        inputType: inputType,
      }

      // put the user into the respective queue, "all" will put the user into both queues.
      if (inputType === "audio") {
        addToQueue(audioQueue, userInfo)
      } else if (inputType === "text") {
        addToQueue(textQueue, userInfo)
      } else {
        addToQueue(audioQueue, userInfo)
        addToQueue(textQueue, userInfo)
      }

      console.log(`At socket ${socketID} the user ${username} whose ID is ${userID} is ready to send ${inputType}`);

      // finding a partner
      let result = matching(audioQueue, textQueue, userInfo)

      // if found a matching partner
      if (result !== null) {
        console.log(`Client: ${result.client.username}, Servant: ${result.servant.username}, Room type: ${result.roomType}`)

        // result = { client: , servant: , roomType: , accepted: 0 }
        result.accepted = 0
        promptQueue.push(result)
        
        // send prompt to both users for confirm ready.
        io.to(result.client.socketID).emit('match', {
          client: result.client,
          servant: result.servant,
          roomType: result.roomType,
        })
        io.to(result.servant.socketID).emit('match', {
          client: result.client,
          servant: result.servant,
          roomType: result.roomType,
        })
      } 
    })

    // when both users confirm the second prompt, create a room and send them the information of the room.
    socket.on('confirm prompt', ({ socketID, userID, username, inputType }) => {
      let userInfo = {
        socketID: socketID,
        userID: userID,
        username: username,
        inputType: inputType,
      }

      let promptQueueIndex = checkExist(promptQueue, userInfo)
      if (promptQueueIndex !== -1) {
        let pair = promptQueue[promptQueueIndex]
        if (pair.accepted === 0) {
          pair.accepted++
          // tell one of the user that need the other user's prompt to continue.
          io.to(socketID).emit('wait for other prompt', ({}))
        } else {
          // create a room for two, send them id.
          createRoom(pair.client.userID, pair.servant.userID, pair.roomType)
          .then(roomID => {
            // tell both users that the room is ready
            io.to(pair.client.socketID).emit('prompt successful', ({
              roomID: roomID,
            }))
            io.to(pair.servant.socketID).emit('prompt successful', ({
              roomID: roomID,
            }))
          })
        }
      } else {
        // return error here!!! Need to handle error!!!
        console.log("Fail confirming prompt due to some shenanigan... can't find pair brrrrrrr");
      }
    })

    // when the user deny or miss the second ready prompt
    socket.on('cancel prompt', ({ socketID, userID, username, inputType }) => {
      let userInfo = {
        socketID: socketID,
        userID: userID,
        username: username,
        inputType: inputType,
      }

      // check if the pair exists in the prompt queue
      let promptQueueIndex = checkExist(promptQueue, userInfo)
      if (promptQueueIndex !== -1) {
        // remove those two mofo off the prompt queue
        let pair = promptQueue[promptQueueIndex]
        removeFromQueue(promptQueue, pair)

        // add the other user back to the HEAD of the queue
        let theOtherUser = pair.client.userID === userInfo.userID ? pair.servant : pair.client;
        if (theOtherUser.inputType === "audio") {
          addToQueue(audioQueue, theOtherUser)
        } else if (theOtherUser.inputType === "text") {
          addToQueue(textQueue, theOtherUser)
        } else {
          addToQueue(audioQueue, theOtherUser)
          addToQueue(textQueue, theOtherUser)
        }
        
        io.to(theOtherUser.socketID).emit('requeue', ({}))
      } else {
        // return error here!!! Need to handle error!!!
        console.log("Fail cancelling prompt due to some shenanigan... can't find pair brrrrrrr");
      }
    })

    // cancel ready status before the second confirmation (before "match" signal).
    socket.on('cancel ready', ({ socketID, userID, username, inputType }) => {
      let userInfo = {
        socketID: socketID,
        userID: userID,
        username: username,
        inputType: inputType,
      }
      removeFromQueue(audioQueue, userInfo);
      removeFromQueue(textQueue, userInfo);
      console.log(`The user ${username} whose ID is ${userID} has cancelled their ready status`);
    })

    // when an user enters the room, announce to everyone else in the room
    socket.on('joinRoom', async ({ socketID, chatroomID, userID, username }) => {

      // -1 - no slot left  0 - already in room  1 - got in there successfully
      let status = await addSlot(chatroomID, userID);

      if (status === 1) {
        socket.join(chatroomID);
        console.log(`The user ${username} has joined chatroom: ${chatroomID}`);
        
        // sending to individual socketid (private message)	
        io.to(chatroomID).emit('joinRoom announce', {	
          username: username,	
        });
      } else if (status === -1) {
        io.to(socketID).emit('room full', {});
      } else if (status === 0) {
        socket.join(chatroomID);
        console.log(`The user ${username} has rejoined chatroom: ${chatroomID}`);

        io.to(chatroomID).emit('joinRoom announce', {	
          username: username,	
        });
      } else {
        console.log("how the fuck...??? joinRoom mainsocket.js")
      }
    });

    // when an user leaves the room, announce to everyone else in the room
    socket.on('leaveRoom', ({ chatroomID, userID, username }) => {

      // remember to remove user from the user slot. (set it to null)
      kickUser(chatroomID, userID)

      socket.leave(chatroomID);
      console.log(`The user ${username} has left chatroom: ${chatroomID}`)

      // sending to individual socketid (private message)
      io.to(chatroomID).emit('leaveRoom announce', {	
        username: username,	
      });
    });

    // Just receive a signal
    socket.on('chatroomAudio', ({ chatroomID, sender, link }) => {
      // sending to individual socketid (private message)
      io.to(chatroomID).emit('newAudioURL', {
        userID: socket.userId,
        sender: sender,
        audioLink: link,
      });
      console.log("Receive audio in chatroom " + chatroomID + " from " + sender + ". Here's the audio link: " +  link)
    });

    socket.on('client intent', async ({ roomID, audioID, key, intent }) => {

      const FILE_MONO = `${tempFolder}/anothertmp_${key}.wav`;
      console.log("Receive client intent: " + JSON.stringify(intent) + " of audio " + audioID + " from room " + roomID);

      // check turn of the room. Throw a fit if it's not 1. If it's 1 then: 
      Chatroom.findById(roomID)
      .then(async (roomFound) => {
        if (!roomFound) {
          console.log("... Some shenanigan.. Room doesn't even exist.");
          // IMPLEMENT SOME KIND OF ERROR!!!
          return null;
        } else {
          if (roomFound.turn !== 1) {
            console.log("... Some shenanigan.. It's not client's turn to send intent.");
            // IMPLEMENT SOME KIND OF ERROR!!!
            return null;
          } else {
            // create intent
            let extractIntent = {
              action: null,
              device: null,
              floor: null,
              room: null,
              scale: null,
              level: null,
            };

            if (intent !== null) {
              intent.map(property => {
                return extractIntent[property.key] = property.value;
              })
            }
            const { action, device, floor, room, scale, level } = extractIntent;
            const newIntent = await Intent.create({
              action,
              device,
              floor,
              room,
              scale,
              level,
            });

            // save intent to audio
            Audio.findById(audioID)
            .then(async (audioFound) => {
              if (!audioFound) {
                console.log("... Some shenanigan.. Audio doesn't even exist.");
                // IMPLEMENT SOME KIND OF ERROR!!!
                return null;
              } else {
                audioFound.intent = newIntent._id;
                return audioFound.save();
              }
            })
            .catch(err => {
              // IMPLEMENT SOME KIND OF ERROR!!!
              console.log("Can't update audio's intent, ", err);
            })

            roomFound.turn = 2;
            return roomFound.save();
          }
        }
      })
      .catch(err => {
        // IMPLEMENT SOME KIND OF ERROR!!!
        console.log(err);
      })

      // doing exec audio here
      if(fs.existsSync(FILE_MONO)) {
        getTranscript(FILE_MONO, `${TRANSCRIPT_FOLDER}/${audioID}.txt`, key, () => {
          console.log("done")
        })
      } else {
        console.log("File is not ready to be transcripted!");
      }
    });

    socket.on('servant intent', async ({ roomID, intent }) => {
      
      // parse the received intent
      if (intent === null) {
        intent = {
          device: null,
          room: null,
          action: null,
          scale: null,
          floor: null,
          level: null,
        };
      } else {
        const properties = ["action", "device", "floor", "room", "scale", "level"];
        for (let key in properties) {
          if(intent[properties[key]] === undefined) intent[properties[key]] = null
        }
      }

      // compare servant's intent and client's intent.
      const compare = await Chatroom.findById(roomID)
      .then(async (roomFound) => {
        // check room status.
        if (!roomFound) {
          console.log("... Some shenanigan.. Room doesn't even exist.");
          // IMPLEMENT SOME KIND OF ERROR!!!
          return null;
        } else {
          if (roomFound.turn !== 2) {
            console.log("... Some shenanigan.. It's not servant's turn to send intent.");
            // IMPLEMENT SOME KIND OF ERROR!!!
            return null;
          } else {
            
            // get latest audio.
            const latestAudioID = roomFound.audioList[roomFound.audioList.length - 1]
            return Audio.findById(latestAudioID)
            .populate('intent')

            // check intent against audio's intent.
            .then(audioFound => {
              // console.log(audioFound.intent)
              const result = compareIntent(audioFound.intent, intent);
              // if the intent is an exact match to the audio's intent, update audio's revertable status to true in case if it's removed later on.
              if (result) {
                audioFound.revertable = true;
                // I'm so afraid of this shit... it may cause a lot of potential BUG!!!
                audioFound.save((err, audioUpdated) => {
                  if (err) return false;
                  return true;
                })
              }
              return result
            })
            .catch(err => console.log("Error: ", err))
          }
        }
      })
      .catch(err => console.log(err))

      // if correct, emit a signal, telling both of them that's it's okay. Update the progress for the room and move turn to 3.
      if (compare) {

        await Chatroom.findById(roomID)
        .then(async (roomFound) => {
          if (!roomFound) {
            console.log("... Some shenanigan.. Room doesn't even exist.");
            // IMPLEMENT SOME KIND OF ERROR!!!
            return null;
          } else {
            // already check up there but fuck it, just in case.
            if (roomFound.turn !== 2) {
              console.log("Saving intent... Some shenanigan.. It's not servant's turn to send intent.");
              // IMPLEMENT SOME KIND OF ERROR!!!
              return null;
            } else {
              // update progress
              const newProgress = await Progress.findById(roomFound.progress)
              .then(progressFound => {
                if (!progressFound) {
                  console.log("... Some shenanigan.. Progress doesn't even exist.");
                } else {
                  for (const property in intent) {
                    if(intent[property] !== null) {
                      if(progressFound[property] === -1) {
                        console.log("... something's wrong with progress and intent... property: ", property);
                        console.log(`Progress: `, progressFound);
                        console.log(`Intent: `, intent);
                        // IMPLEMENT SOME KIND OF ERROR!!!
                        return 
                      } else {
                        progressFound[property]++;
                      }
                    }
                  }
                }
                return progressFound.save();
              })
              .catch(err => console.log(err))

              // emit signal
              io.to(roomID).emit('intent correct', {
                newProgress: newProgress,
              });
              
              if (
                newProgress.action !== 0 &&
                newProgress.device !== 0 && 
                newProgress.floor !== 0 &&
                newProgress.room !== 0 &&
                newProgress.scale !== 0 &&
                newProgress.level !== 0) {
                  roomFound.done = true;
                }
                

              // update turn
              // BUG!!!! Since there's no error system for progress updating so even though if there's any problem with progress updating, the system will still move on.
              roomFound.turn = 3;
              return roomFound.save();
            }
          }
        })
        .catch(err => console.log(err))
        
        
      } else {
        // else emit a signal, telling the servant that he/she fucked up. Do it again, or press the godly "DELETE" button to remove the client's audio reverse the turn to 1.. 
        io.to(roomID).emit('intent incorrect', {});
      }
    });

    socket.on('servant audio', async ({ roomID, audioID, key }) => {
      
      const FILE_MONO = `${tempFolder}/anothertmp_${key}.wav`;
      
      // update room turn
      Chatroom.findById(roomID)
      .then(async (roomFound) => {
        if (!roomFound) {
          console.log("... Some shenanigan.. Room doesn't even exist.");
          // IMPLEMENT SOME KIND OF ERROR!!!
          return null;
        } else {

          // create intent, servant intent is always null. Not having any intention is an intent.
          const newIntent = await Intent.create({
            action: null,
            device: null,
            floor: null,
            room: null,
            scale: null,
            level: null,
          });

          // save intent to audio
          Audio.findById(audioID)
          .then(async (audioFound) => {
            if (!audioFound) {
              console.log("... Some shenanigan.. Audio doesn't even exist.");
              // IMPLEMENT SOME KIND OF ERROR!!!
              return null;
            } else {
              audioFound.intent = newIntent._id;
              return audioFound.save();
            }
          })
          .catch(err => {
            // IMPLEMENT SOME KIND OF ERROR!!!
            console.log("Can't update audio's intent, ", err);
          })

          roomFound.turn = 1;
          return roomFound.save();
        }
      })
      .catch(err => {
        // IMPLEMENT SOME KIND OF ERROR!!!
        console.log(err);
      })

      // doing exec audio here
      if(fs.existsSync(FILE_MONO)) {
        getTranscript(FILE_MONO, `${TRANSCRIPT_FOLDER}/${audioID}.txt`, key, () => {
          console.log("done")
        })
      } else {
        console.log("File is not ready to be transcripted!");
      }
    });

    socket.on("remove audio", ({ roomID }) => {
      console.log("Removing audio in room ", roomID);
      io.to(roomID).emit('audio removed');
    });

    socket.on("Recording", ({ roomID }) => {
      io.to(roomID).emit("user recording", {});
    })

    socket.on("Done Recording", ({ roomID }) => {
      io.to(roomID).emit("user done recording", {});
    })
    
    socket.on("fix transcript", ({ roomID, username, editContent, index }) => {
      if (index !== -1) {
        io.to(roomID).emit("update transcript", {
          username: username,
          transcript: editContent,
          index: index,
        });
      } else {
        // DO I need to put a update transcript fail here?
      }
    })

    // when receive a message
    socket.on("Input Chat message", msg => {
      try {
        var message = new Message({ message: msg.chatMes, sender:msg.userId,intent: msg.intent, chatroomID:msg.chatroomID });
        message.save(function (err,doc) {
          if(err) return console.error(doc)
          Message.find({"_id": doc._id})
              .populate("sender")
              .exec((err,doc)=>{
                return io.emit("Output Chat Message", doc);
              })
          console.log(doc)
        })
      } catch (error) {
        console.error(error);
      }
    });
  
  });

  // Need to add a "I don't understand button, please say the line again" for both side. None of them can delete their own audios unless the other party does so.
  // If the button is pressed, the last message that was sent out of the room will be deleted. (Of course, can't always press it). 
  // This gonna be a problem since I have to update code for both amazon server and local server. Or I can cheat just by deleting the record of the room. 
  // But since the policy of the website is that once the conversation is over, the room will be destroy along with its record... Maybe I should create a log for that.
  // Create a log for the record so deleting audio won't be a problem.
  // Also create a log for those deleted record. So can pluck em out and put them into a trash folder
}

const addToQueue = (queue, userInfo) => {
  let count = 0;
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].userID === userInfo.userID) {
      count++;
      break;
    }
  }
  
  if (count === 0) queue.push(userInfo);
}

const removeFromQueue = (queue, target) => {
  // var index = queue.indexOf(target);
  var index = queue.findIndex(item => compareObject(item, target))
  if (index !== -1) {
    return queue.splice(index, 1);
  }
  return null;
}

const matching = (audioQueue, textQueue, userInfo) => {
  let matchingPartner;
  // check if there's someone in the queue
  if (audioQueue.length >= 2 && audioQueue.includes(userInfo)) {
    // if there's, create a room, then remove those two mofo out of the queue
    removeFromQueue(audioQueue, userInfo)
    removeFromQueue(textQueue, userInfo)
    
    matchingPartner = audioQueue.shift()
    removeFromQueue(textQueue, matchingPartner)

    // decide who's the client, who's the servant
    return {client: userInfo, servant: matchingPartner, roomType: "audio"}
  } else if (textQueue.length >= 2 && textQueue.includes(userInfo)) {
    // if there's, create a room, then remove those two mofo out of the queue
    removeFromQueue(audioQueue, userInfo)
    removeFromQueue(textQueue, userInfo)

    matchingPartner = textQueue.shift()
    removeFromQueue(audioQueue, matchingPartner)

    // decide who's the client, who's the servant
    return {client: userInfo, servant: matchingPartner, roomType: "text"}
  } else return null
}

const checkExist = (queue, userInfo) => {
  let result = -1
  queue.map((pair, index) => {
    if(compareObject(pair.client, userInfo) || compareObject(pair.servant, userInfo)) {
      result = index
      // PROBLEM!!! how to break from this (map) loop?
    } 
  })

  return result
}

const compareObject = (obj1, obj2) => {
  // This is the lazy way. 
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

const { Chatroom } = require("./../models/Chatroom");
const { Audio } = require("./../models/Audio");

const createRoom = async (userID1, userID2, roomType) => {
  // user1 - client, user2 - servant
  let content_type = roomType === "audio" ? 0 : 1
  const randomValue = randomGenerator()

  let intent = await createRandomIntent()
  let progress = await createRandomProgress(
    intent.action, 
    intent.device, 
    intent.floor,
    intent.room,
    intent.scale,
    intent.level,
  )
  const chatroom = await Chatroom.create({
    name: generateName() + randomValue,
    task: generateTask(intent.action, intent.device),
    content_type: content_type,
    user1: userID1,
    user2: userID2,
    client: [userID1],
    servant: [userID2],
    intent: intent._id,
    progress: progress._id,
    turn: 1,
  })

  return chatroom._id
}

const randomGenerator = () => {
  return Math.floor(Math.random() * 1000);
}

const generateName = () => {
  // IMPLEMENT!!!
  return "Room R"
}

const generateTask = (action, device) => {
  return `${action} ${device.toLowerCase()}`
}

const { DEVICE, COLOR } = require("./../config/intent");
// const { DEVICE, COLOR } = require("./../config/intent");

const createRandomIntent = () => {
  // gen device
  let target = getRandomFromArray(DEVICE);
  let device = target.name 
  // gen floor 
  let floor = genRandomInt(1, 4);
  if (device === "Cổng") {
    floor = 1;
  }
  // gen room
  let room = getRandomFromArray(target.room);
  // gen action
  let targetAction = getRandomFromArray(target.action);
  let action = targetAction.name;
  // gen scale and level
  let targetScale = null;
  let scale = null;
  let level = null;
  if (targetAction.scale != null) {
    if (targetAction.requireScale === 1 || Math.floor(Math.random() * 2) === 1) {
      targetScale = getRandomFromArray(targetAction.scale);
    } 
  }
  if (targetScale != null) {
    scale = targetScale.name;
    // Can't deal with this yet... Hardcode on frontend side for now.
    // if (scale === 'Màu') {
    //   level = COLOR[Math.floor(Math.random() * 2)];
    // } else {
    level = genRandomInt(targetScale.min, targetScale.max);
    // }
  }

  const intent = Intent.create({
    action: action,
    device: device,
    floor: floor,
    room: room,
    scale: scale,
    level: level,
  })

  return intent
}

const { Progress } = require("./../models/Progress")

const createRandomProgress = (action, device, floor, room, scale, level) => {
  const progress = Progress.create({
    action: (action === null ? -1 : 0),
    device: (device === null ? -1 : 0),
    floor: (floor === null ? -1 : 0),
    room: (room === null ? -1 : 0),
    scale: (scale === null ? -1 : 0),
    level: (level === null ? -1 : 0),
  })

  return progress
}

const getRandomFromArray = (arr) => {
  var item = arr[Math.floor(Math.random() * arr.length)]
  return item
}

const genRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// intent1 from client, intent2 from servant
const compareIntent = (intent1, intent2) => {

  if (intent1.scale === "Màu") {
    return (intent1.action === intent2.action || (intent1.action === null && intent2.action === null)) && 
    (intent1.device === intent2.device || (intent1.device === null && intent2.device === null)) && 
    (intent1.room === intent2.room || (intent1.room === null && intent2.room === null)) && 
    (intent1.floor === intent2.floor || (intent1.floor === null && intent2.floor === null)) && 
    (intent1.scale === intent2.scale || (intent1.scale === null && intent2.scale === null)) && 
    (COLOR[intent1.level] === intent2.level || (intent1.level === null && intent2.level === null));
  } else {
    return (intent1.action === intent2.action || (intent1.action === null && intent2.action === null)) && 
    (intent1.device === intent2.device || (intent1.device === null && intent2.device === null)) && 
    (intent1.room === intent2.room || (intent1.room === null && intent2.room === null)) && 
    (intent1.floor === parseInt(intent2.floor) || (intent1.floor === null && intent2.floor === null)) && 
    (intent1.scale === intent2.scale || (intent1.scale === null && intent2.scale === null)) && 
    (intent1.level === intent2.level  || (intent1.level === null && intent2.level === null));
  }
}

const kickUser = (roomID, userID) => {

  Chatroom.findById(roomID)
  .then(roomFound => {
    if (!roomFound) {
      console.log("... Some shenanigan.. Room doesn't even exist.");
      // IMPLEMENT SOME KIND OF ERROR!!!
      return null;
    } else {
      // special treatment for those who has completed the room.
      if (roomFound.done) return null;

      // check if the room has the user and remove them. Otherwise it's aight, don't fret.
      let count = 0;
      // lol mongoose is unique really
      if (roomFound.user1 !== null && roomFound.user1.equals(userID)) {
        roomFound.user1 = null;
        count++;
      }
      if (roomFound.user2 !== null && roomFound.user2.equals(userID)) {
        roomFound.user2 = null;
        count++;
      }

      if (count !== 0) return roomFound.save();
      else return null;
    }
  })
  .catch(err => console.log("Kicking user: ", err))
}

// -1 - no slot left
//  0 - already in room
//  1 - got in there successfully
const addSlot = async (roomID, userID) => {
  return await Chatroom.findById(roomID)
  .then(async (roomFound) => {
    if (!roomFound) {
      console.log("... Some shenanigan.. Room doesn't even exist.");
      // IMPLEMENT SOME KIND OF ERROR!!!
      return null;
    } else {

      const roomProgress = await checkProgress(roomFound.progress);
      if (roomProgress === 1) {
        if ((roomFound.user1 !== null && roomFound.user1.equals(userID)) || 
          (roomFound.user2 !== null && roomFound.user2.equals(userID))) { 
          return 0;
        }
        else return -1;
      }

      // check if the room has the user.
      if ((roomFound.user1 !== null && roomFound.user1.equals(userID)) || 
          (roomFound.user2 !== null && roomFound.user2.equals(userID))) {
        // IMPLEMENT ANNOUNCEMENT!
        return 0;
      }

      // check if the room has any slot left 
      if (roomFound.user1 === null || roomFound.user2 === null) {
        // check the room record of client and servant if the user has been here before

        // if they have been here before
        if (roomFound.client.includes(userID)) {
          if (roomFound.user1 === null) {
            roomFound.user1 = userID;
            roomFound.save();
            return 1;
          } else return -1;
        } else if (roomFound.servant.includes(userID)) {
          if (roomFound.user2 === null) {
            roomFound.user2 = userID;
            roomFound.save();
            return 1;
          } else return -1;
        } else {
          // if they have NOT been here before
          // check if the room has any slot left (order based on turn)
          if (roomFound.turn === 1) {
            if (roomFound.user1 === null) {
              roomFound.user1 = userID;
              roomFound.client.push(userID);
              roomFound.save();
              return 1;
            } else if (roomFound.user2 === null) {
              roomFound.user2 = userID;
              roomFound.servant.push(userID);
              roomFound.save();
              return 1;
            } else {
              // IMPLEMENT ANNOUNCEMENT!
              return -1;
            }
          } else {
            if (roomFound.user2 === null) {
              roomFound.user2 = userID;
              roomFound.servant.push(userID);
              roomFound.save();
              return 1;
            } else if (roomFound.user1 === null) {
              roomFound.user1 = userID;
              roomFound.client.push(userID);
              roomFound.save();
              return 1;
            } else {
              // IMPLEMENT ANNOUNCEMENT!
              return -1;
            }
          }
        }
      } else return -1;
    }
  })
  .catch(err => console.log("Kicking user: ", err))
}

// -1 - non-existence.
//  0 - not done.
//  1 - done.
const checkProgress = (progressID) => {
  return Progress.findById(progressID)
    .then(progressFound => {
      if (!progressFound) {
        console.log("... Some shenanigan.. Audio doesn't even exist.");
        // IMPLEMENT SOME KIND OF ERROR!!!
        return -1;
      } else {
        if (
          progressFound.action === 0 ||
          progressFound.device === 0 || 
          progressFound.floor === 0 ||
          progressFound.room === 0 ||
          progressFound.scale === 0 ||
          progressFound.level === 0) 
          return 0;
        else return 1;
      }
    })
    .catch(err => console.log("adding slot... finding progress by id: ", err))
}

module.exports = sockets;