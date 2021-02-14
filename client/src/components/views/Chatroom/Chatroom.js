import React, {useState, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Row, Col, Input} from 'antd';
import './Section/Shared/RecordButton.css';
import './Chatroom.css'
import Scenario from './Section/Client/Scenario';
import AudioList from './Section/Shared/AudioList';
import AudioRecordingScreen from './Section/Sub-container/AudioRecordingScreen'
import {getRoom} from '../../../_actions/chatroom_actions'
import TextChatScreen from './Section/Sub-container/TextChatScreen';

const {TextArea} = Input;

export default function Chatroom(props) {
  const canvasRef = useRef(null);
  let socket = props.socket
  const room_content_type = window.location.href.split("/")[4]
  const chatroomID = window.location.href.split("/")[5]
  const user = useSelector(state => state.user);
  const message = useSelector(state => state.message);
  let userID = user.userData ? user.userData._id : "";
  let username = user.userData ? user.userData.name : "";
  const [ userRole, setUserRole ] = useState("");
  const [ audioHistory, setAudioHistory ] = useState([]);
  const [ scenario, setScenario ] = useState([]);
  const [ progress, setProgress ] = useState([]);
  const [ turn, setTurn ] = useState("");

  const dispatch = useDispatch();

  // as they say, there's some problem with setState that I need to clean up so I'll just drop a bomb here as a mark
  // vvvvv Flood gate to make sure dispatch is fired only once. But like this, it won't get refired even if another component of the page is re-rendered.
  if(userRole === "") {
    dispatch(getRoom(chatroomID))
    .then(async (response) => {
      if (userID === response.payload.roomFound.user1) setUserRole("client");
      if (userID === response.payload.roomFound.user2) setUserRole("servant");
      const intent = response.payload.roomFound.intent
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

      let tempProgress = []
      const progress = response.payload.roomFound.progress
      for(const property in progress) {
        if (property !== '_id' && property !== '__v' && progress[property] !== null) {
          tempProgress.push([
            property,
            progress[property],
            // key: property,
            // value: progress[property],
          ])
        }
      }
      setProgress(tempProgress);

      const audios = response.payload.roomFound.audioList;
      let tempAudioList = []
      audios.map(audio => {
        // return tempAudioList.push(audio.link)
        return tempAudioList = [audio.link, ...tempAudioList]
        // setAudioHistory((audioHistory) => [...audioHistory, audio.link])
      })

      if(audios.length % 2 === 0) {
        setTurn('client')
      } else if (audios.length % 2 === 1) {
        setTurn('servant')
      } else setTurn("")

      setAudioHistory(tempAudioList)
    })
  }

  useEffect(() => {
    if (socket) {
      socket.emit("joinRoom", {
        chatroomID,
        username,
      });
    }

    return () => {
      if (socket) {
        socket.emit("leaveRoom", {
          chatroomID,
          username,
        });
      }
    };
  }, [socket, chatroomID, username])

  useEffect(() => {
    if (socket) {
      socket.on('newAudioURL', ({ userID, sender, audioLink }) => {
        console.log(`Receive signal from ${sender} with the ID of ${userID}. Here's the link: ${audioLink}`)
        let newHistory = [...audioHistory]
        // newHistory.push(data.audioLink)
        newHistory = [audioLink, ...audioHistory]
        setAudioHistory(newHistory)
        if(turn === "client") {
          setTurn("servant")
        } else if (turn === "servant") {
          setTurn("client")
        } else setTurn("")
      })

      socket.on('joinRoom announce', (data) => {
        console.log(`User ${data.username} has joined the room`)
      })

      socket.on('leaveRoom announce', (data) => {
        console.log(`User ${data.username} has left the room`)
      })
    }
    // Idk about this... it may cause problem later...
  }, [turn, socket, audioHistory])

  return (
      <div className="chatroom">
        <Row>
          <Col style={{textAlign: "center"}}>
            <p>You are the {userRole}</p>
          </Col>
        </Row>
        <Row>
          <Col span={20}>
            {room_content_type === '0' ?
              <AudioRecordingScreen
                recordingTurn={turn === userRole && turn !== ""}
                canvasRef={canvasRef}
                socket={socket}
                user={user}
                scenario={scenario}
                roomContentType={room_content_type}
                chatroomID={chatroomID}
                userRole={userRole}
              /> :
              <TextChatScreen 
                socket={socket} 
                user={user} 
                chatroomID={chatroomID}
                dispatch={dispatch} 
                message={message} 
                userRole={userRole}/>}
          </Col>
          <Col span={4}>
            <Row>
              <Col>
                {
                  // Got to update this scenario={scenario} to scenario={progress}
                  userRole === "client" ? <Scenario scenario={scenario} progress={progress}/> : (
                    <>
                      <h3 style={{textAlign: "center"}}>Ghi chú công việc đã làm được</h3>
                      <TextArea style={{height: "200px"}} maxLength={100}/>
                    </>
                  )
                }
              </Col> 
            </Row>

            <Row>
              <Col>
                {room_content_type === '0' ? <AudioList audioList={audioHistory}/> : ""}
              </Col> 
            </Row>
          </Col>
        </Row>
      </div>
  )
}
