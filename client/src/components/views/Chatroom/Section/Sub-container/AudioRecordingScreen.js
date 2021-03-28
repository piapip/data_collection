import React, {useRef, useEffect, useState} from 'react';

// import { Tooltip } from 'antd';
import { Grid } from '@material-ui/core';
import {/*ShareIcon,*/ RedoIcon, PlayOutlineIcon, StopIcon} from '../../../../ui/icons';

import RecordButton from '../../../CustomRecorder/Recorder';

import Wave from '../Shared/Wave';
import Status from '../Shared/Status';
import Dropdown from '../Shared/Dropdown';

import ClientSendButton from '../Client/ClientSendButton';

import ServantSendButton from '../Servant/ServantSendButton';

import LoadingComponent from '../../../Loading/LoadingComponent';

export default function AudioRecordingScreen(props) {
  const canvasRef = props.canvasRef;
  const audioRef = useRef(null);

  let socket = props ? props.socket : null;
  const roomDone = props ? props.roomDone : false;
  const audioName = props ? props.audioName : "";
  const chatroomID = props ? props.chatroomID : "";
  const roomName = props ? props.roomName : "";
  const user = props ? props.user : null;
  const userRole = props ? props.userRole : "";
  const turn = props ? props.turn : false;
  const message = props ? props.message : "Loading";
  const latestAudio = props ? props.latestAudio : null;
  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ audio, setAudio ] = useState(null);
  const [ intent, setIntent ] = useState(null);
  const [ genericIntent, setGenericIntent ] = useState(null);
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

  // const tooltipPlay = <span>Play</span>;
  // const tooltipRerecord = <span>Re-record</span>;


  function onRerecord() {
    setAudio(null);
  }

  // function onShare() {
  //   console.log("Shared");
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
              <button
                className="play"
                type="button"
                onClick={toggleIsPlaying}
              >
                <span className="padder">
                  {isPlaying ? <StopIcon/> : <PlayOutlineIcon/>}
                </span>
              </button>
              {isPlaying ? (
                <div className="placeholder"/>
              ) : (
                <>
                  <button className="redo" type="button" onClick={onRerecord}>
                    <span className="padder">
                      <RedoIcon/>
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    } else return ""
  }

  const setNewIntent = (intentValue) => {
    let newIntent = {
      intent: intentValue
    };

    setIntent(newIntent);
  }

  const setNewGenericIntent = (genericIntentValue) => {
    let newGenericIntent = {
      generic_intent: genericIntentValue
    };

    setGenericIntent(newGenericIntent);
  }

  const setSlot = (slot, value) => {
    let newIntent = {...intent};
    newIntent[slot] = value;
    setIntent(newIntent);
  }

  return (
    <>
      <div style={{ position: 'absolute', top:"80px", width: "66%" }}>
        <Status
          userRole={userRole}
          message={roomDone ? "Nhiệm vụ phòng đã kết thúc! Bạn có thể rời phòng và bắt đầu cuộc trò chuyện khác. Cảm ơn bạn." : message} />
      </div>

      <Grid container justify="center" style={{paddingTop: "15vh"}}>
        <div className="primary-buttons">
          <canvas className="primary-buttons canvas" ref={canvasRef}/>
          <RecordButton
            turn={((turn === 1 && userRole === "client" && !roomDone) || (turn === 3 && userRole === "servant" && !roomDone)) && (audio === null)}
            roomID={chatroomID}
            socket={socket}
            isRecording={isRecording}
            setAudio={setAudio}
            setIsRecording={setIsRecording}/>
        </div>
      </Grid>

      {/* latest audio */}
      {
        audio === null ? (
          <Grid container justify="center">
            <audio 
              controls
              key={latestAudio}
              autoPlay={true}
              preload="auto"
              style={{ display: "block" }}
            >
              <source src={latestAudio} type={getAudioFormat()}/>
            </audio>
          </Grid>
        ) : ""
      }
      

      <Grid container>
        <Grid item sm={12} md={12}>
          <div style={{width: '100%', margin: '1rem auto', paddingLeft: "10px"}}>
            <Dropdown 
              toggleTagVisibility={toggleTagVisibility}
              visible={tagVisibility}
              disabled={!((turn === 2 && userRole === "servant") || (turn === 1 && userRole === "client"))}
              setIntent={setNewIntent}
              setGenericIntent={setNewGenericIntent}
              setSlot={setSlot}/>
          </div>
        </Grid>

        <Grid item sm={12} md={12}>
          <div className="submit-button">
            {renderAudio(audio)}
            {
              userRole === "client" ? (
                <ClientSendButton
                  roomName={roomName}
                  audioName={audioName}
                  turn={turn}
                  disable={(intent === null && tagVisibility) || roomDone}
                  rejectButtonDisabled={latestAudio === null}
                  socket={socket}
                  audio={audio} 
                  intent={tagVisibility ? intent : genericIntent}
                  userRole={userRole}
                  userID={user.userData ? user.userData._id : ""}
                  roomID={chatroomID}
                  sendAudioSignal={sendAudioSignal}/>
              ) : 
              userRole === "servant" ? (
                <ServantSendButton
                  roomName={roomName}
                  audioName={audioName}
                  socket={socket}
                  roomDone={roomDone}
                  disable={(intent === null && tagVisibility) || roomDone}
                  turn={turn}
                  audio={audio}
                  rejectButtonDisabled={latestAudio === null}
                  intent={tagVisibility ? intent : genericIntent}
                  userRole={userRole}
                  userID={user.userData ? user.userData._id : ""}
                  roomID={chatroomID}
                  sendAudioSignal={sendAudioSignal}/>
              ) : (
                <LoadingComponent />
              )
            }
            
          </div>
        </Grid>
      </Grid>
    </>
  )
}

