import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import {Row, Col, Modal} from 'antd';

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
  const [ scenario, setScenario ] = useState([]);
  const [ progress, setProgress ] = useState([]);
  const [ turn, setTurn ] = useState(-1);
  const [ loading, setLoading ] = useState(true);
  const [ redirect, setRedirect ] = useState(false); // redirect is the substitute of history.
  const [ message, setMessage ] = useState("Loading");

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

  useEffect(() => {
    if (userRole !== "" && socket !== null && user !== null) {
      setLoading(false);
    } else setLoading(true);
  }, [userRole, socket, user]);
 
  // as they say, there's some problem with setState that I need to clean up so I'll just drop a bomb here as a mark
  // vvvvv Flood gate to make sure dispatch is fired only once. But like this, it won't get refired even if another component of the page is re-rendered.
  if(userRole === "") {
    dispatch(getRoom(chatroomID))
    .then(async (response) => {
      if (userID === response.payload.roomFound.user1) setUserRole("client");
      if (userID === response.payload.roomFound.user2) setUserRole("servant");
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
      audios.map(audio => {
        // return tempAudioList.push(audio.link)
        return tempAudioList = [audio.link, ...tempAudioList];
      })

      setTurn(response.payload.roomFound.turn);
      if (response.payload.roomFound.turn === 1) {
        setMessage(StatusMessage.TURN_CLIENT_START);
      } else setMessage(StatusMessage.TURN_SERVANT_START);

      setAudioHistory(tempAudioList);
      setLoading(false);
    })
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
      });
  
      socket.on('joinRoom announce', ({ username }) => {
        // console.log(`User ${username} has joined the room`);
        setMessage(`${username} đã vào phòng.`);
      });
  
      socket.on('leaveRoom announce', ({ username }) => {
        // console.log(`User ${username} has left the room`);
        setMessage(`${username} đã rời phòng.`);
      });
  
      socket.on('intent incorrect', () => {
        // console.log(`Servant doesn't seem to understood client's intent!`)
        setMessage(StatusMessage.INTENT_INCORECT);
      });
    }
  });

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
      socket.on('newAudioURL', ({ userID, sender, audioLink }) => {
        // console.log(`Receive signal from ${sender} with the ID of ${userID}. Here's the link: ${audioLink}`)
        let newHistory = [...audioHistory];
        // newHistory.push(data.audioLink)
        newHistory = [audioLink, ...audioHistory];
        setAudioHistory(newHistory);
        // if client sent then move on
        if(turn === 1) {
          setTurn(2);
          setMessage(StatusMessage.TURN_TWO_TRANSITION);
          if (userRole === "servant") {
            setIsModalVisible(true);
          }
        // if servant sent then move on
        } else if (turn === 3) {
          setTurn(1);
          setMessage(StatusMessage.TURN_ONE_TRANSITION);
          if (userRole === "client") {
            setIsModalVisible(true);
          }
        } else {
          // when turn = 2 (Throw a fit... shoudn't be triggered this thing at that time)
          // when turn = -1 (loading...)
        }
      });
    }
    // Idk about this... it may cause problem later...
  }, [turn, socket, audioHistory, userRole]);

  useEffect(() => {
    if (socket) {
      socket.on('audio removed', () => {
        let newHistory = [...audioHistory];
        newHistory.shift();
        setAudioHistory(newHistory);

        if (turn === 1) {
          setTurn(3);
          setMessage(StatusMessage.AUDIO_REMOVED_CLIENT);
        } else if (turn === 2) {
          setTurn (1);
          setMessage(StatusMessage.AUDIO_REMOVED_SERVANT);
        }
      });
    }
  }, [audioHistory, socket, turn]);

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
    progress.map(item => {
      return item[1] === 0 ? count++ : "";
    })

    if (count !== 0) return true;
    else return false;
  }

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (redirect) {
    return (
      <Redirect to={"/"} socket={socket} />
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
      <Modal 
        closable={false}
        visible={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}>
        <p>Tới lượt của bạn</p>
      </Modal>
      <div className="chatroom">
        <Row>
          <Col span={20}>
            {room_content_type === '0' ?
              <AudioRecordingScreen
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
          <Col span={4}>
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

            <Row>
              <Col>
                {room_content_type === '0' ? <AudioList audioList={audioHistory}/> : ""}
              </Col> 
            </Row>
          </Col>
        </Row>
      </div>
      </>
    )
  }
}
