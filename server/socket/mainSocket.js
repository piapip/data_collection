var sockets = {};
const { User } = require("./../models/User");
const { Intent } = require("./../models/Intent");
const { Audio } = require("./../models/Audio");
const { Domain } = require("./../models/Domain");
const { IntentRecord } = require("./../models/IntentRecord");
const config = require("./../config/key");
const axios = require("axios");

sockets.init = function (server) {
  // socket.io setup
  const io = require("socket.io")(server, {
    cors: { origin: "http://localhost:3000" },
  });
  // const io = require('socket.io')(server, {
  //   path: '/socket',
  // });

  const jwt = require("jsonwebtoken");

  // socket logic go here
  io.use(async (socket, next) => {
    try {
      // Must be matched with the frontend.
      const token = socket.handshake.query.token;
      if (token !== "undefined" && token !== "null" && token !== "") {
        // await jwt.verify(token, 'secret', (err, decode) => {
        await jwt.verify(token, config.JWT_SECRET_KEY, (err, decode) => {
          if (err) console.log(err);
          else {
            const ssoUserId = decode.ssoUserId;
            User.findOne({ ssoUserId: ssoUserId }).then((userFound) => {
              socket.userId = userFound._id;
              next();
            });
            // socket.userId = decode
            // next()
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
  let audioQueue = []; // ready for audio room
  let textQueue = []; // ready for text room
  let promptQueue = []; // ready to join room
  let idle = []; // not in queue
  let inRoom = [];
  // ^^^^^ server socket

  // vvvvv client socket
  io.on("connection", (socket) => {
    console.log("Connected: " + socket.id);

    if (!idle.includes(socket.id)) idle.push(socket.id);
    // io.to(socket.id).emit("refresh status", {
    //   idle: idle.length,
    //   inQueue: audioQueue.length,
    //   inRoom: inRoom.length,
    // })

    socket.on("disconnect", () => {
      console.log("Disconnected: " + socket.id);
      let indexQueue = audioQueue.findIndex(
        (item) => item.socketID === socket.id
      );
      if (indexQueue !== -1) {
        audioQueue.splice(indexQueue, 1);
      } else {
        indexQueue = textQueue.findIndex((item) => item.socketID === socket.id);
        if (indexQueue !== -1) {
          textQueue.splice(indexQueue, 1);
        }
      }

      const indexIdle = idle.findIndex((item) => {
        return item === socket.id;
      });
      if (indexIdle !== -1) idle.splice(indexIdle, 1);

      // Check room status too.
      const inRoomIndex = inRoom.findIndex((item) => {
        return item.socketID === socket.id;
      });
      if (inRoomIndex !== -1) {
        kickUser(inRoom[inRoomIndex].roomID, inRoom[inRoomIndex].userID);
        io.to(inRoom[inRoomIndex].roomID).emit("leaveRoom announce", {
          username: inRoom[inRoomIndex].username,
        });
        inRoom.splice(inRoomIndex, 1);
      }
    });

    // when receive ready signal from user
    socket.on(
      "ready",
      ({ socketID, userID, username, inputType, campaignID }) => {
        let userInfo = {
          socketID: socketID,
          userID: userID,
          username: username,
          inputType: inputType,
          campaignID: campaignID,
        };

        const indexIdle = idle.findIndex((item) => {
          return item === socket.id;
        });
        if (indexIdle !== -1) idle.splice(indexIdle, 1);

        // put the user into the respective queue, "all" will put the user into both queues.
        if (inputType === "audio") {
          addToQueue(audioQueue, userInfo);
        } else if (inputType === "text") {
          addToQueue(textQueue, userInfo);
        } else {
          addToQueue(audioQueue, userInfo);
          addToQueue(textQueue, userInfo);
        }

        console.log(
          `At socket ${socketID} the user ${username} whose ID is ${userID} is ready to send ${inputType}`
        );

        // finding a partner
        let result = matching(audioQueue, textQueue, userInfo);

        // if found a matching partner
        if (result !== null) {
          console.log(
            `Client: ${result.client.username}, Servant: ${result.servant.username}, Room type: ${result.roomType}`
          );

          // result = { client: , servant: , roomType: , accepted: 0 }
          result.accepted = 0;
          promptQueue.push(result);

          // send prompt to both users for confirm ready.
          io.to(result.client.socketID).emit("match", {
            client: result.client,
            servant: result.servant,
            roomType: result.roomType,
          });
          io.to(result.servant.socketID).emit("match", {
            client: result.client,
            servant: result.servant,
            roomType: result.roomType,
          });
        }
      }
    );

    // when both users confirm the second prompt, create a room and send them the information of the room.
    socket.on(
      "confirm prompt",
      ({ socketID, userID, username, inputType, timer, campaignID }) => {
        let userInfo = {
          socketID: socketID,
          userID: userID,
          username: username,
          inputType: inputType,
          campaignID,
        };

        let promptQueueIndex = checkExist(promptQueue, userInfo);
        if (promptQueueIndex !== -1) {
          let pair = promptQueue[promptQueueIndex];
          if (pair.accepted === 0) {
            pair.accepted++;
            // tell one of the user that need the other user's prompt to continue.
            io.to(socketID).emit("wait for other prompt", {});
            setTimeout(async () => {
              let promptQueueIndex = checkExist(promptQueue, userInfo);
              if (promptQueueIndex !== -1) {
                // remove those two mofo off the prompt queue
                let pairUser = promptQueue[promptQueueIndex];
                removeFromQueue(promptQueue, pairUser);

                // add the other user back to the HEAD of the queue
                let theOtherUser =
                  pairUser.client.userID === userInfo.userID
                    ? pairUser.servant
                    : pairUser.client;
                if (userInfo.inputType === "audio") {
                  addToQueue(audioQueue, userInfo);
                } else if (userInfo.inputType === "text") {
                  addToQueue(textQueue, userInfo);
                } else {
                  addToQueue(audioQueue, userInfo);
                  addToQueue(textQueue, userInfo);
                }

                io.to(userInfo.socketID).emit("requeue", {});
                io.to(theOtherUser.socketID).emit("too late", {});
              }
            }, 10000 - timer * 1000);
          } else {
            // create a room for two, send them id.
            createRoom(
              pair.client.userID,
              pair.servant.userID,
              pair.roomType,
              campaignID
            ).then((roomID) => {
              // tell both users that the room is ready
              io.to(pair.client.socketID).emit("prompt successful", {
                roomID: roomID,
              });
              io.to(pair.servant.socketID).emit("prompt successful", {
                roomID: roomID,
              });
            });
          }
        } else {
          // return error here!!! Need to handle error!!!
          console.log(
            "Fail confirming prompt due to some shenanigan... can't find pair brrrrrrr"
          );
        }
      }
    );

    // when the user deny or miss the second ready prompt
    socket.on(
      "cancel prompt",
      ({ socketID, userID, username, inputType, campaignID }) => {
        let userInfo = {
          socketID: socketID,
          userID: userID,
          username: username,
          inputType: inputType,
          campaignID,
        };

        // check if the pair exists in the prompt queue
        let promptQueueIndex = checkExist(promptQueue, userInfo);
        if (promptQueueIndex !== -1) {
          // remove those two mofo off the prompt queue
          let pair = promptQueue[promptQueueIndex];
          removeFromQueue(promptQueue, pair);

          // add the other user back to the HEAD of the queue
          let theOtherUser =
            pair.client.userID === userInfo.userID ? pair.servant : pair.client;
          if (theOtherUser.inputType === "audio") {
            addToQueue(audioQueue, theOtherUser);
          } else if (theOtherUser.inputType === "text") {
            addToQueue(textQueue, theOtherUser);
          } else {
            addToQueue(audioQueue, theOtherUser);
            addToQueue(textQueue, theOtherUser);
          }

          io.to(theOtherUser.socketID).emit("requeue", {});
        } else {
          // return error here!!! Need to handle error!!!
          console.log(
            "Fail cancelling prompt due to some shenanigan... can't find pair brrrrrrr"
          );
        }
      }
    );

    // cancel ready status before the second confirmation (before "match" signal).
    socket.on(
      "cancel ready",
      ({ socketID, userID, username, inputType, campaignID }) => {
        let userInfo = {
          socketID: socketID,
          userID: userID,
          username: username,
          inputType: inputType,
          campaignID,
        };
        removeFromQueue(audioQueue, userInfo);
        removeFromQueue(textQueue, userInfo);
        console.log(
          `The user ${username} whose ID is ${userID} has cancelled their ready status`
        );
      }
    );

    // when an user enters the room, announce to everyone else in the room
    socket.on(
      "joinRoom",
      async ({ socketID, chatroomID, userID, username }) => {
        const inRoomIndex = inRoom.findIndex((item) => {
          return item.socketID === socketID;
        });
        if (inRoomIndex === -1)
          inRoom.push({
            roomID: chatroomID,
            userID: userID,
            username: username,
            socketID: socketID,
          });
        // -1 - no slot left  0 - already in room  1 - got in there successfully
        let status = await addSlot(chatroomID, userID);

        if (status === 1) {
          socket.join(chatroomID);
          console.log(
            `The user ${username} has joined chatroom: ${chatroomID}`
          );

          // sending to individual socketid (private message)
          io.to(chatroomID).emit("joinRoom announce", {
            username: username,
            userID: userID,
          });
        } else if (status === -1) {
          io.to(socketID).emit("room full", {});
        } else if (status === 0) {
          socket.join(chatroomID);
          console.log(
            `The user ${username} has rejoined chatroom: ${chatroomID}`
          );

          io.to(chatroomID).emit("joinRoom announce", {
            username: username,
            userID: userID,
          });
        } else {
          console.log("how the fuck...??? joinRoom mainsocket.js");
        }
      }
    );

    // when an user leaves the room, announce to everyone else in the room
    socket.on("leaveRoom", ({ chatroomID, userID, username }) => {
      // remember to remove user from the user slot. (set it to null)
      kickUser(chatroomID, userID);

      const inRoomIndex = inRoom.findIndex((item) => {
        return item.socketID === socket.id;
      });
      if (inRoomIndex !== -1) inRoom.splice(inRoomIndex, 1);

      socket.leave(chatroomID);

      // sending to individual socketid (private message)
      io.to(chatroomID).emit("leaveRoom announce", {
        username: username,
      });
    });

    // Just receive a signal
    socket.on("chatroomAudio", ({ chatroomID, sender, link }) => {
      // sending to individual socketid (private message)
      io.to(chatroomID).emit("newAudioURL", {
        userID: socket.userId,
        sender: sender,
        audioLink: link,
      });
      console.log(
        "Receive audio in chatroom " +
          chatroomID +
          " from " +
          sender +
          ". Here's the audio link: " +
          link
      );
    });

    socket.on(
      "client intent",
      async ({ roomID, audioID, intentDetailed, campaignID }) => {
        // console.log("Receive client intent: " + JSON.stringify(intentDetailed) + " of audio " + audioID + " from room " + roomID);

        // parse the received intent, let's try getting intentrecord's id, slot's id and slot values
        let intentRecordID = null;
        let slots = [];
        let slot_values = [];

        await Domain.find({ campaignID })
          .populate({
            path: "intents",
            populate: {
              path: "slots",
            },
          })
          .then((domainFound) => {
            if (domainFound.length === 0) {
              console.log("... Some shenanigan.. Domain doesn't even exist.");
            } else {
              const targetDomain = domainFound[0];
              const intentList = targetDomain.intents;
              for (const key of Object.keys(intentDetailed)) {
                // if it's slot
                if (key !== "intent" && key !== "generic_intent") {
                  // traverse through the intentList to find the slot
                  let targetSlot;
                  for (let i = 0; i < intentList.length; i++) {
                    const slotList = intentList[i].slots;
                    const slotIndex = slotList.findIndex((slot) => {
                      return slot.name === key;
                    });

                    if (slotIndex !== -1) {
                      targetSlot = slotList[slotIndex]._id;
                      slots.push(targetSlot);
                      slot_values.push(intentDetailed[key]);
                      break;
                    }
                  }
                } else {
                  // if it's intent, "intent" collection dgaf if it's generic_intent or intent
                  // find that intentrecord's id
                  const targetIntentName = intentDetailed[key];
                  const intentIndex = intentList.findIndex((intent) => {
                    return intent.name === targetIntentName;
                  });
                  intentRecordID = intentList[intentIndex]._id;
                }
              }
            }
          });

        // for (const key of Object.keys(intentDetailed)) {
        //   // console.log(key);
        //   // if it's slot
        //   if (key !== "intent" && key !== "generic_intent") {
        //     // find that slot's id by the name, normally, intent doesn't care if it's slot or subslot
        //     const targetSlot = (await Slot.find({ name: key }))[0];
        //     slots.push(targetSlot._id);
        //     // save its value
        //     slot_values.push(intentDetailed[key]);
        //   } else {
        //     // if it's intent, "intent" collection dgaf if it's generic_intent or intent
        //     // find that intentrecord's id
        //     // Firstly, let's get all the intent from the domain
        //     intentRecordID = await Domain.find({ campaignID })
        //       .populate("intents")
        //       .then((domainFound) => {
        //         if (domainFound.length === 0) {
        //           console.log(
        //             "... Some shenanigan.. Domain doesn't even exist."
        //           );
        //         } else {
        //           const targetIntentName = intentDetailed[key];
        //           const { intents } = domainFound[0];
        //           const intentIndex = intents.findIndex((intent) => {
        //             return intent.name === targetIntentName;
        //           });
        //           return intents[intentIndex]._id;
        //         }
        //       });
        //     // console.log("intentRecordID: ", intentRecordID);
        //   }
        // }

        // check turn of the room. Throw a fit if it's not 1. If it's 1 then:
        await Chatroom.findById(roomID)
          .populate("currentIntent")
          .then(async (roomFound) => {
            if (!roomFound) {
              console.log("... Some shenanigan.. Room doesn't even exist.");
              // IMPLEMENT SOME KIND OF ERROR!!!
              return null;
            } else {
              if (roomFound.turn !== 1) {
                console.log(
                  "... Some shenanigan.. It's not client's turn to send intent."
                );
                // IMPLEMENT SOME KIND OF ERROR!!!
                return null;
              } else {
                let newIntent;
                // if the audio has some intent
                if (intentRecordID !== null) {
                  newIntent = await Intent.create({
                    intent: intentRecordID,
                    slots,
                    slot_values,
                  });
                  // save intent to audio
                  Audio.findById(audioID)
                    .then(async (audioFound) => {
                      if (!audioFound) {
                        console.log(
                          "... Some shenanigan.. Audio doesn't even exist."
                        );
                        // IMPLEMENT SOME KND OF ERROR!!!
                        return null;
                      } else {
                        audioFound.intent = newIntent._id;
                        // audioFound.prevIntent = flattenIntent(
                        //   roomFound.currentIntent
                        // );
                        return audioFound.save();
                      }
                    })
                    .catch((err) => {
                      // IMPLEMENT SOME KIND OF ERROR!!!
                      console.log("Can't update audio's intent, ", err);
                    });
                }

                roomFound.turn = 2;
                return roomFound.save();
              }
            }
          })
          .catch((err) => {
            // IMPLEMENT SOME KIND OF ERROR!!!
            console.log(err);
          });

        io.to(roomID).emit("refresh cheatsheet", {});

        setTimeout(async () => {
          let transcript = await Audio.findById(audioID).then((audioFound) => {
            if (!audioFound) {
              console.log("... Some shenanigan.. Audio doesn't even exist.");
              // IMPLEMENT SOME KIND OF ERROR!!!
              return null;
            }

            return audioFound.transcript;
          });

          // console.log(`transcript: ${transcript}`)

          io.to(roomID).emit("update transcript", {
            // a very special case, because we don't have any way to retrieve newly uploaded audioID in the frontend.
            username: audioID,
            transcript: transcript,
            index: -1,
          });
        }, 4000);
      }
    );

    socket.on(
      "servant intent",
      async ({ roomID, intentDetailed, campaignID }) => {
        // parse the received intent, let's try getting intentrecord's id, slot's id and slot values
        let intentRecordID = null;
        let slots = [];
        let slot_values = [];
        await Domain.find({ campaignID })
          .populate({
            path: "intents",
            populate: {
              path: "slots",
            },
          })
          .then((domainFound) => {
            if (domainFound.length === 0) {
              console.log("... Some shenanigan.. Domain doesn't even exist.");
            } else {
              const targetDomain = domainFound[0];
              const intentList = targetDomain.intents;
              for (const key of Object.keys(intentDetailed)) {
                // if it's slot
                if (key !== "intent" && key !== "generic_intent") {
                  // traverse through the intentList to find the slot
                  let targetSlot;
                  for (let i = 0; i < intentList.length; i++) {
                    const slotList = intentList[i].slots;
                    const slotIndex = slotList.findIndex((slot) => {
                      return slot.name === key;
                    });

                    if (slotIndex !== -1) {
                      targetSlot = slotList[slotIndex]._id;
                      slots.push(targetSlot);
                      slot_values.push(intentDetailed[key]);
                      break;
                    }
                  }
                } else {
                  // if it's intent, "intent" collection dgaf if it's generic_intent or intent
                  // find that intentrecord's id
                  const targetIntentName = intentDetailed[key];
                  const intentIndex = intentList.findIndex((intent) => {
                    return intent.name === targetIntentName;
                  });
                  intentRecordID = intentList[intentIndex]._id;
                }
              }
            }
          });
        // for (const key of Object.keys(intentDetailed)) {
        //   // console.log(key);
        //   // if it's slot
        //   if (key !== "intent" && key !== "generic_intent") {
        //     // find that slot's id by the name, normally, intent doesn't care if it's slot or subslot
        //     const targetSlot = (await Slot.find({ name: key }))[0];
        //     slots.push(targetSlot._id);
        //     // save its value
        //     slot_values.push(intentDetailed[key]);
        //   } else {
        //     // if it's intent, "intent" collection dgaf if it's generic_intent or intent
        //     // find that intentrecord's id
        //     // Firstly, let's get all the intent from the domain
        //     intentRecordID = await Domain.find({ campaignID })
        //       .populate("intents")
        //       .then((domainFound) => {
        //         if (domainFound.length === 0) {
        //           console.log(
        //             "... Some shenanigan.. Domain doesn't even exist."
        //           );
        //         } else {
        //           const targetIntentName = intentDetailed[key];
        //           const { intents } = domainFound[0];
        //           const intentIndex = intents.findIndex((intent) => {
        //             return intent.name === targetIntentName;
        //           });
        //           return intents[intentIndex]._id;
        //         }
        //       });
        //   }
        // }

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
                console.log(
                  "... Some shenanigan.. It's not servant's turn to send intent."
                );
                // IMPLEMENT SOME KIND OF ERROR!!!
                return null;
              } else {
                // get latest audio.
                const latestAudioID =
                  roomFound.audioList[roomFound.audioList.length - 1];
                return (
                  Audio.findById(latestAudioID)
                    .populate("intent")

                    // check intent against audio's intent.
                    .then((audioFound) => {
                      const result = compareIntent(
                        audioFound.intent,
                        intentRecordID,
                        slots,
                        slot_values
                      );
                      // if the intent is an exact match to the audio's intent, update audio's revertable status to true in case if it's removed later on.
                      if (result) {
                        audioFound.revertable = true;
                        // I'm so afraid of this shit... it may cause a lot of potential BUG!!!
                        audioFound.save((err, audioUpdated) => {
                          if (err) return false;
                          return true;
                        });
                      }
                      return result;
                    })
                    .catch((err) => console.log("Error: ", err))
                );
              }
            }
          })
          .catch((err) => console.log(err));

        // if correct, update intentRecord count
        // then emit a signal, telling both of them that's it's okay. Update the current intent for the room and move turn to 3.
        if (compare) {
          // console.log("Update current intent: " + JSON.stringify(intentDetailed));
          await Chatroom.findById(roomID)
            .populate("intent")
            .then(async (roomFound) => {
              if (!roomFound) {
                console.log("... Some shenanigan.. Room doesn't even exist.");
                // IMPLEMENT SOME KIND OF ERROR!!!
                return null;
              } else {
                // already check up there but fuck it, just in case.
                if (roomFound.turn !== 2) {
                  console.log(
                    "Saving intent... Some shenanigan.. It's not servant's turn to send intent."
                  );
                  // IMPLEMENT SOME KIND OF ERROR!!!
                  return null;
                } else {
                  // update IntentRecord count
                  IntentRecord.findById(intentRecordID).then((intentFound) => {
                    intentFound.count++;
                    intentFound.save();
                  });
                  // update currentIntent
                  const newIntent = await Intent.findById(
                    roomFound.currentIntent
                  )
                    .populate("intent")
                    .then(async (currentIntentFound) => {
                      if (!currentIntentFound) {
                        console.log(
                          "... Some shenanigan.. CurrentIntent doesn't even exist."
                        );
                      } else {
                        // no need to update if it's just a generic intent.
                        if (
                          intentDetailed.generic_intent !== null &&
                          intentDetailed.generic_intent !== undefined
                        )
                          return currentIntentFound;
                        else {
                          console.log(currentIntentFound);
                          if (
                            intentDetailed.intent !== null &&
                            (currentIntentFound.intent === null ||
                              !intentRecordID.equals(
                                currentIntentFound.intent._id
                              ))
                          ) {
                            currentIntentFound = transferObject(
                              currentIntentFound,
                              {
                                intent: intentRecordID,
                                slots,
                                slot_values,
                              }
                            );

                            // console.log("Transfer result: ", currentIntentFound);
                          } else {
                            // transfer slots and values from up there to the currentIntent
                            for (let i = 0; i < slots.length; i++) {
                              if (slots[i] !== null) {
                                // find the current index of that slot
                                const indexSlot =
                                  currentIntentFound.slots.findIndex(
                                    (targetSlot) => targetSlot.equals(slots[i])
                                  );
                                // if it's already there, we replace the old value to the new one
                                if (indexSlot !== -1) {
                                  currentIntentFound.slot_values[indexSlot] =
                                    slot_values[i];
                                } else {
                                  // otherwise, push that slot and its value to the currentIntent.
                                  currentIntentFound.slots.push(slots[i]);
                                  currentIntentFound.slot_values.push(
                                    slot_values[i]
                                  );
                                }
                              }
                            }
                            // console.log("Migrate result: ", currentIntentFound);
                          }
                          return await currentIntentFound
                            .save()
                            .then((savedIntent) =>
                              savedIntent
                                .populate({
                                  path: "slots intent",
                                  populate: {
                                    path: "slots",
                                  },
                                })
                                .execPopulate()
                            );
                        }
                      }
                    })
                    .catch((err) =>
                      console.log(
                        "Having trouble updating currenting intent...",
                        err
                      )
                    );

                  if (!roomFound.done) {
                    console.log("Checking done status...");
                    if (
                      compareIntent(
                        roomFound.intent,
                        newIntent.intent._id,
                        newIntent.slots,
                        newIntent.slot_values
                      )
                    ) {
                      roomFound.done = true;
                      updateRoomDoneCount(roomFound.user1);
                      updateRoomDoneCount(roomFound.user2);
                    }
                  }

                  // emit signal
                  io.to(roomID).emit("intent correct", {
                    roomDone: roomFound.done,
                    newIntent: newIntent,
                  });

                  // update turn
                  roomFound.turn = 3;
                  return roomFound.save();
                }
              }
            })
            .catch((err) => console.log(err));
        } else {
          // else emit a signal, telling the servant that he/she fucked up. Do it again, or press the godly "DELETE" button to remove the client's audio reverse the turn to 1..
          io.to(roomID).emit("intent incorrect", {});
        }
      }
    );

    socket.on("servant audio", async ({ roomID, audioID }) => {
      // update room turn
      Chatroom.findById(roomID)
        .populate("currentIntent")
        .then(async (roomFound) => {
          if (!roomFound) {
            console.log("... Some shenanigan.. Room doesn't even exist.");
            // IMPLEMENT SOME KIND OF ERROR!!!
            return null;
          } else {
            // create intent, servant intent is always null.
            // though, not having any intention is an intent but that thought will fuck me up
            // so let's just not create it
            roomFound.turn = 1;
            return roomFound.save();
          }
        })
        .catch((err) => {
          // IMPLEMENT SOME KIND OF ERROR!!!
          console.log(err);
        });

      setTimeout(async () => {
        let transcript = await Audio.findById(audioID).then((audioFound) => {
          if (!audioFound) {
            console.log("... Some shenanigan.. Audio doesn't even exist.");
            // IMPLEMENT SOME KIND OF ERROR!!!
            return null;
          }

          return audioFound.transcript;
        });
        console.log("transcript: ", transcript);

        io.to(roomID).emit("update transcript", {
          // a very special case, because we don't have any way to retrieve newly uploaded audioID in the frontend.
          username: audioID,
          transcript: transcript,
          index: -1,
        });
      }, 4000);
    });

    socket.on("remove audio", ({ roomID }) => {
      console.log("Removing audio in room ", roomID);
      io.to(roomID).emit("audio removed");
    });

    socket.on("Recording", ({ roomID }) => {
      io.to(roomID).emit("user recording", {});
    });

    socket.on("Done Recording", ({ roomID }) => {
      io.to(roomID).emit("user done recording", {});
    });

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
    });

    socket.on("get transcript", ({ audioID, audioURL, userID, chatroomID }) => {
      axios
        .get(`${config.TRANSCRIPT_API}/api/v1/stt?url=${audioURL}`, {
          headers: {
            Authorization: `Bearer ${config.TRANSCRIPT_API_KEY}`,
          },
        })
        .then((response) => {
          const { result, status } = response.data;

          if (status === 1) {
            const { transcription } = result;
            io.to(chatroomID).emit("confirm transcript", {
              audioID,
              audioURL,
              transcription,
              userID,
            });
          } else {
            io.to(chatroomID).emit("confirm transcript", {
              audioID,
              audioURL,
              transcription: "...",
              userID,
            });
          }
        });
    });

    socket.on("transcript confirmed", ({ audioID, userID, newTranscript }) => {
      Audio.findById(audioID)
        .then((audioFound) => {
          if (!audioFound) {
            console.log("Can't find audio to update transcript!");
            throw "Can't find audio";
          } else {
            audioFound.transcript = newTranscript;
            audioFound.fixBy = userID;
            return audioFound.save();
          }
        })
        .then(() => {})
        .catch((err) => {
          console.log(
            `Error while updating audio ${audioID} transcript... ${err}`
          );
        });
    });
  });

  // Create a log for the record so deleting audio won't be a problem.
  // Also create a log for those deleted record. So can pluck em out and put them into a trash folder
};

const addToQueue = (queue, userInfo) => {
  let count = 0;
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].userID === userInfo.userID) {
      count++;
      break;
    }
  }

  if (count === 0) queue.push(userInfo);
};

const removeFromQueue = (queue, target) => {
  // var index = queue.indexOf(target);
  var index = queue.findIndex((item) => compareObject(item, target));
  if (index !== -1) {
    return queue.splice(index, 1);
  }
  return null;
};

const countWithCampaignIDCondition = (array, campaignID) => {
  return array.filter((item) => {
    return item.campaignID === campaignID;
  }).length;
};

const matching = (audioQueue, textQueue, userInfo) => {
  let matchingPartner;
  // check if there's someone in the queue
  // if (audioQueue.length >= 2 && audioQueue.includes(userInfo)) {
  if (
    countWithCampaignIDCondition(audioQueue, userInfo.campaignID) >= 2 &&
    audioQueue.includes(userInfo)
  ) {
    // if there's, create a room, then remove those two mofo out of the queue
    removeFromQueue(audioQueue, userInfo);
    removeFromQueue(textQueue, userInfo);

    matchingPartner = audioQueue.shift();
    removeFromQueue(textQueue, matchingPartner);

    // decide who's the client, who's the servant
    return { client: userInfo, servant: matchingPartner, roomType: "audio" };
  } else if (textQueue.length >= 2 && textQueue.includes(userInfo)) {
    // if there's, create a room, then remove those two mofo out of the queue
    removeFromQueue(audioQueue, userInfo);
    removeFromQueue(textQueue, userInfo);

    matchingPartner = textQueue.shift();
    removeFromQueue(audioQueue, matchingPartner);

    // decide who's the client, who's the servant
    return { client: userInfo, servant: matchingPartner, roomType: "text" };
  } else return null;
};

const checkExist = (queue, userInfo) => {
  let result = -1;
  queue.map((pair, index) => {
    if (
      compareObject(pair.client, userInfo) ||
      compareObject(pair.servant, userInfo)
    ) {
      result = index;
      // PROBLEM!!! how to break from this (map) loop?
    }
  });

  return result;
};

const compareObject = (obj1, obj2) => {
  // This is the lazy way.
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

const compareIntent = (
  targetIntent,
  givenIntentRecordID,
  givenSlots,
  given_slots_values
) => {
  // console.log("targetIntent: ", targetIntent);
  // console.log("givenIntentRecordID: ", givenIntentRecordID);
  // console.log("base slots: ", targetIntent.slots);
  // console.log("givenSlots: ", givenSlots);
  // console.log("given_slots_values: ", given_slots_values);
  const { intent, slots, slot_values } = targetIntent;
  // compare main intent
  if (intent === null && givenIntentRecordID !== null) return false;
  if (!intent.equals(givenIntentRecordID)) return false;

  // compare slot's type,
  // to make it easy, we'll compare length, then we compare value of each array
  if (slots.length !== givenSlots.length) return false;
  for (let i = 0; i < slots.length; i++) {
    const slotIndex = givenSlots.findIndex((slot) => {
      const baseSlotID =
        slots[i]._id !== null && slots[i]._id !== undefined
          ? slots[i]._id
          : slots[i];
      const givenSlotID =
        slot._id !== null && slot._id !== undefined ? slot._id : slot;
      return baseSlotID.equals(givenSlotID);
    });
    if (slotIndex === -1) {
      console.log("Fail slot: ", slots[i]);
      return false;
    }
  }

  // do the same thing to compare slot's values,
  // for some reason, both findIndex and includes doesn't work properly
  if (slot_values.length !== given_slots_values.length) return false;
  for (let i = 0; i < slot_values.length; i++) {
    let target = -1;
    given_slots_values.forEach((value, index) => {
      if (value.toLowerCase() === slot_values[i].toLowerCase()) target = index;
    });
    if (target === -1) {
      console.log("Fail value: ", slot_values[i]);
      return false;
    }
  }

  return true;
};

const { Chatroom } = require("./../models/Chatroom");

const createRoom = async (userID1, userID2, roomType, campaignID) => {
  // user1 - client, user2 - servant
  let content_type = roomType === "audio" ? 0 : 1;
  // const randomValue = randomGenerator();
  const name = await generateName(6);
  const targetDomain = (await Domain.find({ campaignID }))[0];
  let intent = await createRandomIntent(campaignID);
  let currentIntent = await Intent.create({});
  const chatroom = await Chatroom.create({
    name: name,
    // name: "Room R" + randomValue,
    task: generateTask(),
    content_type: content_type,
    user1: userID1,
    user2: userID2,
    client: [userID1],
    servant: [userID2],
    cheat_sheet: [],
    intent: intent._id,
    currentIntent: currentIntent._id,
    turn: 1,
    domain: targetDomain._id,
  }).catch(async (err) => {
    if (err.name === "MongoError") {
      if (err.code === 11000) {
        return await Chatroom.create({
          name: await generateName(16),
          task: generateTask(),
          content_type: content_type,
          user1: userID1,
          user2: userID2,
          client: [userID1],
          servant: [userID2],
          cheat_sheet: [],
          intent: intent._id,
          currentIntent: currentIntent._id,
          turn: 1,
          domain: targetDomain._id,
        });
      }
    } else {
      console.log(err);
      return null;
    }
  });

  return chatroom._id;
};

// const randomGenerator = () => {
//   return Math.floor(Math.random() * 1000000000);
// }

const generateName = async (length) => {
  const name = `Room ${generateRandomString(length)}`;

  return name;
};

const generateTask = () => {
  // IMPLEMENT!!!
  return `A random task name`;
};

const intentSamplePool = require("./../config/intent");
const namePool = require("./../config/name");
const { Slot } = require("../models/Slot");
const createRandomIntent = async (campaignID) => {
  const targetIntent = await Domain.find({ campaignID })
    .populate("intents")
    .then((batchDomainFound) => {
      if (batchDomainFound.length === 0) {
        console.log("Can't find domain while creating a random domain", error);
        return null;
      } else {
        const targetDomain = batchDomainFound[0];
        const intentList = targetDomain.intents.sort(
          (a, b) => a.count - b.count
        );
        return intentList[
          getRandomFromArray(
            intentList.slice(0, Math.ceil(intentList.length / 4))
          )
        ];
      }
    })
    .catch((error) => {
      console.log("Can't create a random intent", error);
      return null;
    });

  const slots = targetIntent.slots;
  tempSlots = [];
  tempSlotValues = [];
  for (let i = 0; i < slots.length; i++) {
    const slotID = slots[i];
    // just to be sure, let's check if the slot exists for the new random intent
    // only continue after this if the id doesn't exist
    if (!tempSlots.includes(slotID)) {
      // let's random a value for this slot
      await Slot.findById(slotID)
        .then(async (slotFound) => {
          if (!slotFound) {
            console.log(
              "Can't find slot while creating a random domain",
              error
            );
            return null;
          } else {
            // if slot's potential values are pre-determined then get one from them.
            if (slotFound.values.length !== 0) {
              // remember this slot ID and its value
              tempSlots.push(slotID);
              tempSlotValues.push(
                slotFound.values[getRandomFromArray(slotFound.values)]
              );
            } else {
              // then it might have some other subslots
              if (slotFound.subSlots.length !== 0) {
                let done = true;
                // we might have to redo this a couple of times.
                while (done) {
                  // let's check the its higher tier if it already exists in the temp record.
                  let higherTierIndex = -1;
                  for (let k = 0; k < tempSlots.length; k++) {
                    if (tempSlots[k].equals(slotFound.lowerThan)) {
                      higherTierIndex = k;
                      break;
                    }
                  }
                  // if the higher tier already exists
                  if (higherTierIndex !== -1) {
                    // we'll random the slot value based on that existed slot
                    await Slot.find({
                      name: tempSlotValues[higherTierIndex],
                    }).then((batchLowerSlotFound) => {
                      if (batchLowerSlotFound.length === 0) {
                        console.log(
                          "Can't find slot while creating a random domain",
                          error
                        );
                        return null;
                      } else {
                        const lowerSlotFound = batchLowerSlotFound[0];
                        // remember this slot ID and its value
                        tempSlots.push(slotID);
                        tempSlotValues.push(
                          lowerSlotFound.values[
                            getRandomFromArray(lowerSlotFound.values)
                          ]
                        );
                        // the randomize job's done from here
                        done = false;
                      }
                    });
                  } else {
                    // in case the higher slot is not here yet
                    // then random a value for this higher tier slot
                    await Slot.findById(slotFound.lowerThan).then(
                      (higherSlotFound) => {
                        if (!higherSlotFound) {
                          console.log(
                            "Can't find slot while creating a random domain",
                            error
                          );
                          return null;
                        } else {
                          // we'll redo this loop since our lower tier slot is not determined yet
                          // remember this higher tier slot ID and its value
                          tempSlots.push(slotFound.lowerThan);
                          tempSlotValues.push(
                            higherSlotFound.values[
                              getRandomFromArray(higherSlotFound.values)
                            ]
                          );
                        }
                      }
                    );
                  }
                }
              } else {
                // now if it has infinite value
                // we'll have to hard code. Can't play around it.
                tempSlots.push(slotID);
                if (slotFound.name === "Họ và tên") {
                  tempSlotValues.push(
                    namePool.NAME[getRandomFromArray(namePool.NAME)]
                  );
                } else if (slotFound.name === "CMND") {
                  tempSlotValues.push(generateNumberWithLength(9));
                } else if (slotFound.name === "4 số cuối tài khoản") {
                  tempSlotValues.push(generateNumberWithLength(4));
                } else {
                  return tempSlotValues.push(generateNumberWithLength(9));
                }
              }
            }
          }
        })
        .catch((error) => {
          console.log("Can't create a random intent", error);
          return null;
        });
    }
  }
  return Intent.create({
    intent: targetIntent._id,
    slots: tempSlots,
    slot_values: tempSlotValues,
  });
};

// transfer information from newObject to the originalObject
const transferObject = (originalObject, newObject) => {
  console.log("Original object: ", originalObject);
  console.log("New object: ", newObject);
  for (let key in newObject) {
    if (newObject.hasOwnProperty(key)) {
      originalObject[key] = newObject[key];
    }
  }

  return originalObject;
};

const getRandomFromArray = (arr) => {
  return Math.floor(Math.random() * arr.length);
};

const kickUser = (roomID, userID) => {
  Chatroom.findById(roomID)
    .then((roomFound) => {
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
    .catch((err) => console.log("Kicking user: ", err));
};

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
        if (roomFound.done) {
          if (
            (roomFound.user1 !== null && roomFound.user1.equals(userID)) ||
            (roomFound.user2 !== null && roomFound.user2.equals(userID))
          ) {
            return 0;
          } else return -1;
        }

        // check if the room has that user already.
        if (
          (roomFound.user1 !== null && roomFound.user1.equals(userID)) ||
          (roomFound.user2 !== null && roomFound.user2.equals(userID))
        ) {
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
    .catch((err) => console.log("Adding user to slot: ", err));
};

const generateRandomString = (length, allowedChars) => {
  let text = "";
  const possible =
    allowedChars ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const generateNumberWithLength = (length) => {
  let text = "";
  const possible = "0123456789";

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// const flattenIntent = (currentIntent) => {
//   const properties = getSlotList();
//   let result = "";
//   for (let key in properties) {
//     if (
//       currentIntent[properties[key]] !== null &&
//       currentIntent[properties[key]] !== undefined
//     ) {
//       const slot = properties[key];

//       switch (slot) {
//         case "city":
//         case "district":
//           result = result + `'${getLabel(slot)}': '${currentIntent[slot]}', `;
//           break;
//         case "generic_intent":
//           result =
//             result +
//             `'${getLabel(slot)}': '${
//               intentSamplePool["GENERIC_INTENT"][currentIntent[slot]]
//             }', `;
//           break;
//         default:
//           if (
//             intentSamplePool[slot.toUpperCase()] === undefined ||
//             currentIntent[slot] === -1
//           ) {
//             result = result + `'${getLabel(slot)}': '${currentIntent[slot]}', `;
//           } else {
//             result =
//               result +
//               `'${getLabel(slot)}': '${
//                 intentSamplePool[slot.toUpperCase()][currentIntent[slot]].name
//               }', `;
//           }
//       }
//     }
//   }
//   result = "{" + result.substring(0, result.length - 2) + "}";
//   return result;
// };

const getLabel = (slot) => {
  const slotIndex = intentSamplePool.SLOT_LABEL.findIndex((item) => {
    return item.tag.toUpperCase() === slot.toUpperCase();
  });

  return slotIndex === -1 ? "" : intentSamplePool.SLOT_LABEL[slotIndex].name;
};

const updateRoomDoneCount = (userID) => {
  if (userID !== null) {
    User.findById(userID).then((userFound) => {
      if (!userFound) throw "Can't find user";
      else {
        userFound.roomDoneCount++;
        return userFound.save();
      }
    });
  }
};

const getSlotList = () => {
  let properties = [];
  for (slot of intentSamplePool.SLOT_LABEL) {
    properties.push(slot.tag.toLowerCase());
  }
  return properties;
};

module.exports = sockets;
