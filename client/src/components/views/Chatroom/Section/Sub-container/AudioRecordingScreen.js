import React, {useRef, useEffect, useState} from 'react';

// import { Row, Col, Tooltip, Checkbox } from 'antd';
import { Row, Col, Tooltip } from 'antd';
import {/*ShareIcon,*/ RedoIcon, PlayOutlineIcon, StopIcon} from '../../../../ui/icons';

import Wave from '../Shared/Wave';
import RecordButton from '../Shared/RecordButton';
import Status from '../Shared/Status';
import CustomAudioPlayer from '../Shared/CustomAudioPlayer';

import ClientSendButton from '../Client/ClientSendButton';
import ClientCheckbox from '../Client/ClientCheckbox';

import ServantSendButton from '../Servant/ServantSendButton';
import ServantDropDown from '../Servant/ServantDropDown';

import LoadingComponent from './../../../Loading/LoadingComponent';

export default function AudioRecordingScreen(props) {
  const canvasRef = props.canvasRef;
  const audioRef = useRef(null);

  let socket = props ? props.socket : null;
  const roomDone = props ? props.roomDone : false;
  const progress = props ? props.progress : [];
  const audioName = props ? props.audioName : "";
  const chatroomID = props ? props.chatroomID : "";
  const user = props ? props.user : null;
  const userRole = props ? props.userRole : "";
  const turn = props ? props.turn : false;
  const message = props ? props.message : "Loading";
  const scenario = props ? props.scenario : [];
  const latestAudio = props ? props.latestAudio : null;
  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ audio, setAudio ] = useState(null);
  const [ intent, setIntent ] = useState(null); 
  const [ isRecording, setIsRecording ] = useState(false);
  const [ tagVisibility, setTagVisibility ] = useState(true);

  useEffect(() => {
    const canvasObj = canvasRef.current;
    let wave = new Wave(canvasObj);
    wave.idle();
    if (wave) {
      isRecording ? wave.play() : wave.idle();
    }
    return () => {
      if (wave) {
        wave.idle();
      }
    }
  });

  const sendAudioSignal = (link) => {
    if (socket) {
      let sender = user.userData.name
      socket.emit("chatroomAudio", {
        chatroomID,
        sender,
        link,
      })
    }
    setAudio(null);
    // setTagVisibility(true);
  }

  const toggleIsPlaying = () => {
    const {current: audio} = audioRef;

    let status = !isPlaying;
    if (status) {
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(status);
  };

  const getAudioFormat = (() => {
    const preferredFormat = 'audio/ogg; codecs=opus';
    const audio = document.createElement('audio');
    const format = audio.canPlayType(preferredFormat)
      ? preferredFormat
      : 'audio/wav';
    return format;
  })

  const tooltipPlay = <span>Play</span>;
  const tooltipRerecord = <span>Re-record</span>;


  function onRerecord() {
    setAudio(null);
  }

  // function onShare() {
  //   console.log("Shared");
  // }

  // const toggleTagVisibility = (e) => {
  //   setTagVisibility(!e.target.checked)
  // }

  const toggleTagVisibility = (value) => {
    setTagVisibility(value)
  }

  const renderAudio = (audio) => {
    if (audio !== null) {
      return (
        <div className="pill">
          <div className="pill done">
            <div className="pill done contents">
              <audio preload="auto" onEnded={toggleIsPlaying} ref={audioRef}>
                <source src={audio.blobURL} type={getAudioFormat()}/>
              </audio>
              <Tooltip
                title={tooltipPlay}
                arrow
                open={isPlaying}
                theme="grey-tooltip">
                <button
                  className="play"
                  type="button"
                  onClick={toggleIsPlaying}
                >
                  <span className="padder">
                    {isPlaying ? <StopIcon/> : <PlayOutlineIcon/>}
                  </span>
                </button>
              </Tooltip>
              {isPlaying ? (
                <div className="placeholder"/>
              ) : (
                <>
                  <Tooltip arrow title={tooltipRerecord}>
                    <button className="redo" type="button" onClick={onRerecord}>
                      <span className="padder">
                        <RedoIcon/>
                      </span>
                    </button>
                  </Tooltip>
                  {/* <Tooltip arrow title={text}>
                    <button className="share" type="button" onClick={onShare}>
                      <span className="padder">
                        <ShareIcon/>
                      </span>
                    </button>
                  </Tooltip> */}
                </>
              )}
            </div>
          </div>
        </div>
      );
    } else return ""
  }

  return (
    <>
      <Status
        userRole={userRole}
        message={roomDone ? "Nhiệm vụ phòng đã kết thúc! Bạn có thể rời phòng và bắt đầu cuộc trò chuyện khác. Cảm ơn bạn." : message}
        turn={turn} />
      <Row style={{textAlign: "center"}}>
        <div className="primary-buttons">
          <canvas className="primary-buttons canvas" ref={canvasRef}
                  style={{width: '100%', position: 'absolute', maxWidth: 'calc(1400px - 40px)'}}/>
          <RecordButton
            turn={((turn === 1 && userRole === "client" && !roomDone) || (turn === 3 && userRole === "servant" && !roomDone)) && (audio === null)}
            roomID={chatroomID}
            socket={socket}
            isRecording={isRecording}
            setAudio={setAudio}
            setIsRecording={setIsRecording}/>
        </div>
      </Row>

      {/* latest audio */}
      <Row type="flex" justify="center" style={{textAlign: "center"}}>
        <CustomAudioPlayer 
          audioLink={latestAudio}
          turn={turn}
          userrole={userRole}
          // remember to change this to true 
          autoPlay={true}/>
      </Row>

      <Row>
        {/* <Row style={{marginLeft: "15px", marginRight: "15px"}}> */}
        <Row>
          <Col>
            <div style={{width: '100%', margin: '1rem auto', paddingLeft: "10px"}}>
              {userRole === "client" && progress !== [] ?
                <ClientCheckbox
                  // visible={tagVisibility && audio !== null}
                  toggleTagVisibility={toggleTagVisibility}
                  progress={progress}
                  intent={tagVisibility ? intent : null}
                  visible={tagVisibility}
                  disabled={!((turn === 2 && userRole === "servant") || (turn === 1 && userRole === "client"))}
                  setIntent={setIntent}
                  list={scenario}  
                /> : 
              userRole === "servant" ? (
                // <Dropdown list={dropdowns}/>
                <ServantDropDown
                  toggleTagVisibility={toggleTagVisibility}
                  turn={turn}
                  intent={intent}
                  visible={tagVisibility}
                  setIntent={setIntent}/>
              ) : (
                <div style={{textAlign: "center"}}>
                  <LoadingComponent />
                </div>
              )
              }
            </div>
          </Col>
        </Row>
        <Row justify="center" style={{display: 'flex', alignItems: 'center'}}>
          <Col span={24}>
            <div className="submit-button">
              {renderAudio(audio)}
              {
                userRole === "client" ? (
                  <ClientSendButton 
                    audioName={audioName}
                    turn={turn}
                    disable={(intent === null && tagVisibility) || roomDone}
                    socket={socket}
                    audio={audio} 
                    intent={tagVisibility ? intent : null}
                    userRole={userRole}
                    userID={user.userData ? user.userData._id : ""}
                    roomID={chatroomID}
                    sendAudioSignal={sendAudioSignal}/>
                ) : (
                  // <SendButton 
                  //   audio={audio} 
                  //   intent={tagVisibility ? intent : null}
                  //   userID={user.userData ? user.userData._id : ""}
                  //   roomID={chatroomID}
                  //   sendAudioSignal={sendAudioSignal}/>

                  <ServantSendButton
                    audioName={audioName}
                    socket={socket}
                    roomDone={roomDone}
                    turn={turn}
                    audio={audio} 
                    intent={tagVisibility ? intent : null}
                    userRole={userRole}
                    userID={user.userData ? user.userData._id : ""}
                    roomID={chatroomID}
                    sendAudioSignal={sendAudioSignal}/>
                )
              }
              
            </div>
          </Col>
          {/* <Col span={6}>
            <Checkbox 
              onChange={toggleTagVisibility} 
              disabled={!((turn === 2 && userRole === "servant") || (turn === 1 && userRole === "client"))}>
                {
                  tagVisibility ? (
                    "Không có tag"
                  ) : (
                    <b>Không có tag</b>
                  )
                }
            </Checkbox>
          </Col> */}
        </Row>
      </Row>
    </>
  )
}

