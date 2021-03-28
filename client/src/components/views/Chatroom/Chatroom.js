import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { Grid, Tabs, Tab, AppBar, Modal, Divider, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import './Section/Shared/RecordButton.css';
import './Chatroom.css';

import StatusMessage from './Section/Shared/StatusMessage';
import AudioList from './Section/Shared/AudioList';
import PromptLeaving from './Section/Shared/PromptLeaving';
// import Guide from './Section/Shared/Guide';
// import RoomStatusPopover from './Section/Shared/RoomStatusPopover';

import Scenario from './Section/Client/Scenario';

import ProgressNote from './Section/Servant/ProgressNote';

import AudioRecordingScreen from './Section/Sub-container/AudioRecordingScreen';

import { getRoom, getCheatSheet } from '../../../_actions/chatroom_actions';

import ErrorNotFound from '../Error/ErrorNotFound';
import LoadingPage from '../Loading/LoadingPage';
import LoadingComponent from '../Loading/LoadingComponent';

import ClientBG from './../LandingPage/Section/images/speak.svg';
import ServantBG from './../LandingPage/Section/images/listen.svg';

const useStyles = makeStyles((theme) => ({
  paper: {
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    // border: '1px solid #dedede',
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function Chatroom(props) {

  const classes = useStyles();
  const canvasRef = useRef(null);
  let socket = props ? props.socket : null;
  const room_content_type = window.location.href.split("/")[4]
  const chatroomID = window.location.href.split("/")[5]
  const user = useSelector(state => state.user);
  let userID = user.userData ? user.userData._id : "";
  let username = user.userData ? user.userData.name : "";
  const [ userRole, setUserRole ] = useState("");
  const [ audioHistory, setAudioHistory ] = useState([]);
  const [ transcriptHistory, setTranscriptHistory ] = useState([]);
  const [ latestAudio, setLatestAudio ] = useState(null);
  const [ scenario, setScenario ] = useState([]);
  const [ currentIntent, setCurrentIntent ] = useState([]);
  const [ cheatSheet, setCheatSheet ] = useState([]);
  const [ turn, setTurn ] = useState(-1);
  const [ loading, setLoading ] = useState(true);
  const [ redirect, setRedirect ] = useState(false); // redirect is the substitute of history.
  const [ message, setMessage ] = useState("Loading");
  const [ roomDone, setRoomDone ] = useState(false);
  const [ roomName, setRoomName ] = useState("");
  const [ tabValue, setTabValue ] = useState(0);

  const [ isModalVisible, setIsModalVisible ] = useState(false);

  const dispatch = useDispatch();

  const updateCurrentIntent = (newIntent) => {
    let tempCurrentIntent = [];
    for(const property in newIntent) {
      if (property !== '_id' && property !== '__v' && newIntent[property] !== null) {
        tempCurrentIntent.push([
          property,
          newIntent[property],
          // key: property,
          // value: currentIntent[property],
        ])
      }
    }
    setCurrentIntent(tempCurrentIntent);
  }

  // const openNotificationWithIcon = (type, message, description) => {
  //   notification[type]({
  //     message: message,
  //     description: description,
  //   });
  // };

  useEffect(() => {
    if (userRole !== "" && socket !== null && user !== null) {
      setLoading(false);
    } else setLoading(true);
  }, [userRole, socket, user]);
 
  // as they say, there's some problem with setState that I need to clean up so I'll just drop a bomb here as a mark
  // vvvvv Flood gate to make sure dispatch is fired only once. But like this, it won't get refired even if another component of the page is re-rendered.
  // useEffect(() => {
  if (userRole === "") {
    if (chatroomID.length !== 0 && userID !== "") {
      dispatch(getRoom(chatroomID))
      .then(async (response) => {
        if (userID === response.payload.roomFound.user1) setUserRole("client");
        if (userID === response.payload.roomFound.user2) setUserRole("servant");
        setRoomDone(response.payload.roomFound.done);
        setRoomName(response.payload.roomFound.name);
        setCheatSheet(response.payload.roomFound.cheat_sheet);

        const scenario = response.payload.roomFound.intent;
        let tempScenario = [];
        for (const property in scenario) {
          if (property !== '_id' && property !== '__v' && scenario[property] !== null) {
            tempScenario.push([
              property,
              (property === 'floor' ? 'Tầng ' + scenario[property] : scenario[property]),
              scenario[property],
              // key: property,
              // label: scenario[property],
              // value: scenario[property],
            ])
          }
        }
        setScenario(tempScenario);

        const currentIntent = response.payload.roomFound.currentIntent;
        let tempCurrentIntent = [];
        for (const property in currentIntent) {
          if (property !== '_id' && property !== '__v' && currentIntent[property] !== null) {
            tempCurrentIntent.push([
              property,
              (property === 'floor' ? 'Tầng ' + currentIntent[property] : currentIntent[property]),
              currentIntent[property],
              // key: property,
              // label: intent[property],
              // value: intent[property],
            ])
          }
        }
        setCurrentIntent(tempCurrentIntent);

        const audios = response.payload.roomFound.audioList;
        let tempAudioList = [];
        let tempTranscriptList = [];
        audios.map(audio => {
          tempTranscriptList.push({
            audioID: audio._id,
            content: audio.transcript,
            yours: userID === audio.user,
            fixBy: audio.fixBy ? audio.fixBy.name : "ASR Bot"
          });
          return tempAudioList.push(audio.link);
          // return tempAudioList = [audio.link, ...tempAudioList];
        })

        setTurn(response.payload.roomFound.turn);
        if (response.payload.roomFound.turn === 1) {
          setMessage(StatusMessage.TURN_CLIENT_START);
        } else setMessage(StatusMessage.TURN_SERVANT_START);

        setTranscriptHistory(tempTranscriptList);
        setAudioHistory(tempAudioList);
        if (audios.length > 0) {
          setLatestAudio(audios[audios.length - 1].link);
        }
        setLoading(false);
      })
    }
  // }, [dispatch, chatroomID, userID])
  }

  useEffect(() => {
    if (socket && userID !== "" && username !== "") {
      let socketID = socket.id;
      socket.emit("joinRoom", {
        socketID,
        chatroomID,
        userID,
        username,
      });
    }

    return () => {
      if (socket) {
        socket.emit("leaveRoom", {
          chatroomID,
          userID,
          username,
        });
      }
    };
  }, [socket, chatroomID, username, userID])

  useEffect(() => {
    if (socket) {
      socket.on('room full', () => {
        setRedirect(true)
        // openNotificationWithIcon('error', 'Phòng không còn chỗ', 'Phòng hoặc đã hết chỗ, hoặc chỗ cũ của bạn đang có người khác dùng!')
      });
  
      socket.on('joinRoom announce', ({ username }) => {
        // console.log(`User ${username} has joined the room`);
        setMessage(`${username} đã vào phòng.`);
        // openNotificationWithIcon('info', `${username} đã vào phòng.`, '')
      });
  
      socket.on('leaveRoom announce', ({ username }) => {
        // console.log(`User ${username} has left the room`);
        setMessage(`${username} đã rời phòng.`);
        // openNotificationWithIcon('info', `${username} đã rời phòng.`, '')
      });
  
      socket.on('intent incorrect', () => {
        // console.log(`Servant doesn't seem to understood client's intent!`)
        setMessage(StatusMessage.INTENT_INCORECT);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('refresh cheatsheet', () => {
        const fetchCheatSheet = () => {
          dispatch(getCheatSheet(chatroomID))
          .then((response) => {
            setCheatSheet(response.payload.cheat_sheet);
          })
        };
  
        fetchCheatSheet();
      })
    }
  }, [socket, chatroomID, dispatch])

  useEffect(() => {
    if (socket) {
      socket.on('intent correct', ({ roomDone, newIntent }) => {
        // console.log(`Servant has understood client's intent correctly! It's now servant turn to record the reply.`);
        setMessage(StatusMessage.INTENT_CORRECT);
        if (roomDone) {
          setRedirect(true);
        }
        updateCurrentIntent(newIntent);
        setTurn(3);        
      });
    }
  }, [scenario, socket]);

  useEffect(() => {
    if (socket && turn !== -1 && userRole !== "") {
      socket.on('newAudioURL', async ({ userID, sender, audioLink }) => {
        console.log(`Receive signal from ${sender} with the ID of ${userID}. Here's the link: ${audioLink}`)
        let newHistory = [...audioHistory];
        newHistory.push(audioLink);
        // await newHistory.unshift(audioLink);
        await setAudioHistory(newHistory);
        await setLatestAudio(audioLink);
        // if client sent then move on
        if(turn === 1) {
          await setTurn(2);
          setMessage(StatusMessage.TURN_TWO_TRANSITION);
          if (userRole === "servant") {
            setIsModalVisible(true);
          }
        // if servant sent then move on
        } else if (turn === 3) {
          await setTurn(1);
          setMessage(StatusMessage.TURN_ONE_TRANSITION);
          if (userRole === "client") {
            setIsModalVisible(true);
          }
        }
        
        return () => {
          socket.off();
        }
      });
    }
    // Idk about this... it may cause problem later...
  }, [turn, socket, audioHistory, userRole]);
  // }, [])

  useEffect(() => {
    if (socket) {
      socket.on('update transcript', ({username, transcript, index}) => {
        if (index === -1) {
          let tempTranscriptList = [...transcriptHistory];
          let newTranscript = {
            // special case, username now becomes audioID
            audioID: username,
            content: transcript,
            yours: false,
            fixBy: "ASR Bot"
          }
          tempTranscriptList.push(newTranscript);
          setTranscriptHistory(tempTranscriptList)
        } else if (transcriptHistory[index]) {
          let tempTranscriptList = [...transcriptHistory];
          tempTranscriptList[index].content = transcript;
          tempTranscriptList[index].fixBy = username;
          // console.log(index)
          setTranscriptHistory(tempTranscriptList);
        }
      })
    }
  }, [transcriptHistory, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('audio removed', () => {
        let newHistory = [...audioHistory];
        newHistory.pop();
        setAudioHistory(newHistory);
        if (newHistory.length === 0) setLatestAudio(null);
        else setLatestAudio(newHistory[0]);

        let tempTranscriptList = [...transcriptHistory];
        tempTranscriptList.pop();
        setTranscriptHistory(tempTranscriptList);

        if (turn === 1) {
          setTurn(3);
          setMessage(StatusMessage.AUDIO_REMOVED_CLIENT);
        } else if (turn === 2) {
          setTurn (1);
          setMessage(StatusMessage.AUDIO_REMOVED_SERVANT);
        }
      });
    }
  }, [audioHistory, transcriptHistory, socket, turn]);

  useEffect(() => {
    if (socket && turn !== -1) {
      socket.on('user recording', () => {
        if (turn === 1) {
          setMessage(StatusMessage.USER_RECORDING_CLIENT);
        } else if (turn === 3) {
          setMessage(StatusMessage.USER_RECORDING_SERVANT);
        } else {
          setMessage('Sao thu âm được hay thế?');
        }
      });

      socket.on('user done recording', () => {
        if (turn === 1) {
          setMessage(StatusMessage.USER_DONE_RECORDING_CLIENT);
        } else if (turn === 3) {
          setMessage(StatusMessage.USER_DONE_RECORDING_SERVANT);
        } else {
          setMessage('Sao thu âm được hay thế?');
        }
      })
    }
  }, [socket, turn])

  const handleLeaveChatroom = () => {
    if (socket) {
      socket.emit("leaveRoom", {
        chatroomID,
        username,
      });
    }
  }

  const handleOk = () => {
    setIsModalVisible(false);
    return (
      <Redirect to={"/"} socket={socket} />
    )
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const generateRandomString = (length, allowedChars) => {
    let text = '';
    const possible =
      allowedChars ||
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const roomStatusContent = (
    <>
      {
        userRole === "client" ? (
          <>
            <Scenario scenario={scenario} currentIntent={currentIntent}/>
            <ProgressNote currentIntent={currentIntent} scenario={scenario}/>
          </>
        ) : 
        userRole === "servant" ? (
        <ProgressNote currentIntent={currentIntent} scenario={scenario}/>) : 
        (
          <LoadingComponent />
        )
      }
    </>
  )

  if (redirect) {
    return (
      <Modal
        disableBackdropClick={true}
        open={isModalVisible}>
        <div className={classes.paper}>
          <p>Cảm ơn bạn đã hoàn thành xong nhiệm vụ này! Giờ bạn có thể rời phòng và bắt đầu cuộc trò chuyện khác!</p>
          <Divider />
          <Button variant="contained" color="default" onClick={handleCancel}>Ở lại phòng</Button>
          <Button variant="contained" style={{marginLeft: "10px", backgroundColor: "#90caf9", color: "#585D5E"}} onClick={handleOk}>Rời phòng</Button>
        </div>
      </Modal>
    )
  }

  if (loading) {
    return (
      <>
        <PromptLeaving 
          when={true}
          onLeave={handleLeaveChatroom}/>
        <LoadingPage />
      </>
    )
  } 

  return (
    <>
      <PromptLeaving 
        onLeave={handleLeaveChatroom}
        when={!roomDone}/>
      <div className="chatroom"
        style={{ height: 'calc(100vh - 69px)' }}
      > 
        <Grid container style={{ height: "100%" }}>
          <Grid item sm={12} md={8}>
            <img className="bg" alt="background"
            src={
              userRole === "client" ? ClientBG:
              userRole === "servant" ? ServantBG : ""} />
            {/* <div style={{position: "absolute", zIndex: "1001"}}>
              <RoomStatusPopover
                content={(
                  <div>
                    <Guide 
                      turn={turn} 
                      cheatSheet={cheatSheet}/>
                  </div>
                )}/>
            </div> */}
            <div>
              {room_content_type === '0' ?
              <AudioRecordingScreen
                audioName={`${audioHistory.length}_${userID}_${generateRandomString(16)}.wav`}
                roomName={roomName}
                roomDone={roomDone}
                latestAudio={latestAudio}
                message={message}
                turn={turn}
                canvasRef={canvasRef}
                socket={socket}
                user={user}
                roomContentType={room_content_type}
                chatroomID={chatroomID}
                userRole={userRole}
              /> :
              <ErrorNotFound />}
            </div>
          </Grid>

          <Grid item sm={12} md={4}
            style={{
              zIndex: "4",
              borderLeft: "1px solid #dedede",
            }}
          >
            <AppBar position="static" color="transparent">
              <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" style={{border: "1px solid #dedede"}}>
                <Tab label="Trạng thái" style={{ textTransform: "none", color: tabValue === 0 ? "#f50057" : "inherit" }} />
                <Tab label="Lịch sử" style={{ textTransform: "none", color: tabValue === 1 ? "#f50057" : "inherit" }} />
              </Tabs>
            </AppBar>

            <div
              hidden={tabValue !== 0}
              style={{
                width: "100%",
                backgroundColor: "white",
              }}>
              <Grid container style={{
                // height: "calc(100vh - 119px)",
                minHeight: "calc(100vh - 119px)",
                overflowY: "scroll",
              }}>
                <div style={{ width: "100%" }}>
                  {roomStatusContent}
                </div>
              </Grid>
            </div>
            
            <div
              hidden={tabValue !== 1}>
              <Grid container>
                <Grid item xs={12}>
                  <AudioList
                    socket={socket}
                    roomID={chatroomID}
                    userID={userID}
                    username={username}
                    userRole={userRole}
                    transcript={transcriptHistory}
                    audioList={audioHistory}/>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
    </div>
    </>
  )
}
