import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { Row, Col, Modal, notification } from 'antd';

import './Section/Shared/RecordButton.css';
import './Chatroom.css';
import StatusMessage from './Section/Shared/StatusMessage';
import Scenario from './Section/Client/Scenario';
import ProgressNote from './Section/Servant/ProgressNote';
import AudioList from './Section/Shared/AudioList';
import AudioRecordingScreen from './Section/Sub-container/AudioRecordingScreen';
import {getRoom} from '../../../_actions/chatroom_actions';
import ErrorNotFound from '../Error/ErrorNotFound';
import LoadingPage from '../Loading/LoadingPage';
import LoadingComponent from '../Loading/LoadingComponent';
import PromptLeaving from './Section/Shared/PromptLeaving';
import ClientBG from './../LandingPage/Section/images/speak.svg';
import ServantBG from './../LandingPage/Section/images/listen.svg';
import Guide from './Section/Shared/Guide';
// import SwitchingTurn from './Section/Shared/SwitchingTurn';

export default function Chatroom(props) {
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
  const [ progress, setProgress ] = useState([]);
  const [ turn, setTurn ] = useState(-1);
  const [ loading, setLoading ] = useState(true);
  const [ redirect, setRedirect ] = useState(false); // redirect is the substitute of history.
  const [ message, setMessage ] = useState("Loading");
  const [ screenHeight, setScreenHeight ] = useState(2560);
  const [ roomDone, setRoomDone ] = useState(false);

  const [ isModalVisible, setIsModalVisible ] = useState(false);

  const dispatch = useDispatch();

  const updateProgress = (newProgress) => {
    let tempProgress = [];
    for(const property in newProgress) {
      if (property !== '_id' && property !== '__v' && newProgress[property] !== null) {
        tempProgress.push([
          property,
          newProgress[property],
          // key: property,
          // value: progress[property],
        ])
      }
    }
    setProgress(tempProgress);
  }

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
    });
  };
  
  useEffect(() => {
    setScreenHeight(window.innerHeight + 90);
  // eslint-disable-next-line
  }, [window.innerHeight])

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
        const intent = response.payload.roomFound.intent;
        let tempIntent = []
        for (const property in intent) {
          if (property !== '_id' && property !== '__v' && intent[property] !== null) {
            tempIntent.push([
              property,
              (property === 'floor' ? 'Tầng ' + intent[property] : intent[property]),
              intent[property],
              // key: property,
              // label: intent[property],
              // value: intent[property],
            ])
          }
        }
        setScenario(tempIntent);

        const progress = response.payload.roomFound.progress;
        updateProgress(progress)

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
    if (socket) {
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
        openNotificationWithIcon('error', 'Phòng không còn chỗ', 'Phòng hoặc đã hết chỗ, hoặc chỗ cũ của bạn đang có người khác dùng!')
      });
  
      socket.on('joinRoom announce', ({ username }) => {
        // console.log(`User ${username} has joined the room`);
        setMessage(`${username} đã vào phòng.`);
        openNotificationWithIcon('info', `${username} đã vào phòng.`, '')
      });
  
      socket.on('leaveRoom announce', ({ username }) => {
        // console.log(`User ${username} has left the room`);
        setMessage(`${username} đã rời phòng.`);
        openNotificationWithIcon('info', `${username} đã rời phòng.`, '')
      });
  
      socket.on('intent incorrect', () => {
        // console.log(`Servant doesn't seem to understood client's intent!`)
        setMessage(StatusMessage.INTENT_INCORECT);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('intent correct', ({ newProgress }) => {
        // console.log(`Servant has understood client's intent correctly! It's now servant turn to record the reply.`);
        setMessage(StatusMessage.INTENT_CORRECT)
        if (newProgress.action !== 0 && newProgress.device !== 0 && newProgress.floor !== 0 && 
          newProgress.room !== 0 && newProgress.scale !== 0 && newProgress.level !== 0) {
          setRedirect(true);
        }
        updateProgress(newProgress);
        setTurn(3);        
      });
    }
  }, [progress, socket]);

  useEffect(() => {
    if (socket) {
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
        if (transcriptHistory.length !== 0) {
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
            console.log(index)
            setTranscriptHistory(tempTranscriptList);
          }
        }
      })
    }
  }, [transcriptHistory, socket])

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
    if (socket) {
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

  const getPromptStatus = () => {
    let count = 0;
    if (progress.length !== 0) 
    {
      progress.map(item => {
        return item[1] === 0 ? count++ : "";
      })
    }

    if (count !== 0) return true;
    else return false;
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

  if (redirect) {
    return (
      <Modal 
        closable={false}
        visible={isModalVisible} 
        onOk={handleOk}
        okText="Rời phòng"
        onCancel={handleCancel}>
        <p>Cảm ơn bạn đã hoàn thành xong nhiệm vụ này! Giờ bạn có thể rời phòng và bắt đầu cuộc trò chuyện khác!</p>
      </Modal>
      // <Redirect to={"/"} socket={socket} />
    )
  }

  if (loading) {
    return (
      <>
        <PromptLeaving 
          when={getPromptStatus()}
          onLeave={handleLeaveChatroom}/>
        <LoadingPage />
      </>
    )
  } else {

    return (
      <>
      <PromptLeaving 
        onLeave={handleLeaveChatroom}
        when={getPromptStatus()}/>
      {/* <Modal 
        closable={false}
        visible={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}>
        <p>Tới lượt của bạn</p>
      </Modal> */}
      <div className="chatroom"
        style={{
          height: `${screenHeight}px`,
          backgroundImage: 
          // userRole === "client" ? 'url(https://img.freepik.com/free-vector/asbtract-sky-pastel-color_56745-107.jpg?size=626&ext=jpg)':
          // userRole === "servant" ? 'url(https://cdn.hipwallpaper.com/i/84/28/PZDy0L.jpg)' : 
          userRole === "client" ? `url(${ClientBG})`:
          userRole === "servant" ? `url(${ServantBG})` : 
          'linear-gradient(0deg, #fff 20%, #f3f2f1)'}}
        >
        <Row>
          <Col xs={24} xl={16}>
            {room_content_type === '0' ?
              <AudioRecordingScreen
                audioName={`${chatroomID}_${audioHistory.length}_${userID}.wav`}
                roomDone={roomDone}
                progress={progress}
                latestAudio={latestAudio}
                message={message}
                turn={turn}
                canvasRef={canvasRef}
                socket={socket}
                user={user}
                scenario={scenario}
                roomContentType={room_content_type}
                chatroomID={chatroomID}
                userRole={userRole}
              /> :
              <ErrorNotFound />}
          </Col>
          <Col xs={24} xl={8} style={{paddingRight: "10px", paddingTop: "10px"}}>

            <Row>
              {
                userRole === "client" ? (
                <Col><Scenario scenario={scenario} progress={progress}/></Col> ) : 
                userRole === "servant" ? (
                <Col><ProgressNote progress={progress} scenario={scenario}/></Col>) : 
                (
                  <Col style={{textAlign: "center", height: "200px", lineHeight: "200px"}}>
                    <LoadingComponent />
                  </Col>
                )
              }
            </Row>

            <Row style={{marginTop: "20px", marginBottom: "20px"}}>
              <Col>
                <Guide turn={turn}/>
              </Col>
            </Row>

            <Row>
              <Col>
                <AudioList
                  socket={socket}
                  roomID={chatroomID}
                  userID={userID}
                  username={username}
                  userRole={userRole}
                  transcript={transcriptHistory}
                  audioList={audioHistory}/>
              </Col> 
            </Row>
          </Col>
        </Row>
      </div>
      </>
    )
  }
}
