import React, {useRef, useEffect, useState} from 'react';

import { Row, Col, Tooltip, Checkbox } from 'antd';
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
    setTagVisibility(true);
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

  const toggleTagVisibility = (e) => {
    setTagVisibility(!e.target.checked)
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
      <Status message={message} />
      <Row style={{textAlign: "center"}}>
        <div className="primary-buttons">
          <canvas className="primary-buttons canvas" ref={canvasRef}
                  style={{width: '100%', position: 'absolute', maxWidth: 'calc(1400px - 40px)'}}/>
          <RecordButton
            turn={((turn === 1 && userRole === "client") || (turn === 3 && userRole === "servant")) && (audio === null)}
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
          autoPlay={true}/>
      </Row>

      <Row>
        <Row>
          <Col>
            <div style={{width: '100%', margin: '1rem auto'}}>
              {userRole === "client" && progress !== [] ?
                <ClientCheckbox
                  // visible={tagVisibility && audio !== null}
                  progress={progress}
                  intent={tagVisibility ? intent : null}
                  visible={tagVisibility}
                  setIntent={setIntent}
                  list={scenario}  
                /> : 
              userRole === "servant" ? (
                // <Dropdown list={dropdowns}/>
                <ServantDropDown
                  turn={turn}
                  intent={intent}
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
          <Col span={12} offset={3}>
            <div className="submit-button">
              {renderAudio(audio)}
              {
                userRole === "client" ? (
                  <ClientSendButton 
                    audioName={audioName}
                    turn={turn}
                    disable={intent === null && tagVisibility}
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
          {/* {
            audio !== null ? (
              <Col span={6}>
                <Checkbox onChange={toggleTagVisibility}>Không có tag</Checkbox>
              </Col>
            ) : ""
          } */}
          <Col span={6}>
            <Checkbox onChange={toggleTagVisibility} disabled={!((turn === 2 && userRole === "servant") || (turn === 1 && userRole === "client"))}>Không có tag</Checkbox>
          </Col>
        </Row>
      </Row>
    </>
  )
}

