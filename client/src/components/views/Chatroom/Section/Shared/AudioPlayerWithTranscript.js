import React, { useState, useRef } from 'react';
import { useDispatch } from "react-redux";

import { Comment, Input, Button } from 'antd';

import { fixTranscript } from '../../../../../_actions/audio_actions';
import LoadingComponent from './../../../Loading/LoadingComponent';
import { PlayOutlineIcon, StopIcon } from '../../../../ui/icons';
import { EditOutlined } from '@ant-design/icons';

export default function AudioPlayerWithTranscript(props) {

  const dispatch = useDispatch();
  const userID = props ? props.userID : "";
  const roomID = props ? props.roomID : "";
  const username = props ? props.username : "";
  const index = props ? props.index : -1;
  let socket = props ? props.socket : null;

  const audioLink = props ? props.audioLink : "";
  const audioRole = props ? props.audioRole : "Loading..."; 
  const autoPlay = props ? props.autoPlay : false;
  let transcript = props ? props.transcript : {};

  if (transcript && (transcript.content === "" || transcript.content === " ")) transcript.content = "...";

  const audioRef = useRef(null);
  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ editMode, setEditMode ] = useState(false);
  const [ editContent, setEditContent ] = useState("")

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

  const onSaveTranscript = () => {
    if(transcript) {
      dispatch(fixTranscript(transcript.audioID, userID, editContent))
      .then(response => {
        if (response.payload.success) {
          // emit a signal here
          setEditMode(false);
          if (socket) {
            socket.emit("fix transcript", {
              roomID,
              username,
              editContent,
              index
            })
          }
        } else {
          alert("Something's wrong with the server. Please not using this function for now.")
        }
      })
    } else {
      setEditMode(false);
    }

    // setEditMode(false)
  }

  if (audioLink === undefined || audioLink === null) return "";

  if (
    socket === null ||
    roomID === "" ||
    userID === "" ||
    username === "" ||
    audioLink === "" ||
    audioRole === "Loading..." ||
    JSON.stringify(transcript) === JSON.stringify({})) {
    return <LoadingComponent />
  }

  return (
    <>
      <Comment
        author={(transcript && transcript.yours) ? <p>Bạn</p> : <p>{audioRole}</p>}
        avatar={
          <>
            <audio 
              key={audioLink}
              autoPlay={autoPlay}
              preload="auto" 
              onEnded={toggleIsPlaying} 
              ref={audioRef}>
              <source src={audioLink} type={getAudioFormat()}/>
            </audio>
            <button
              style={{
                display: "inline-block",
                backgroundColor: "white",
                borderRadius: "50%",
                height: "50px",
                width: "50px",
                lineHeight: "0px",
                justifyContent: "center",
                boxSizing: "border-box",
                // border: '1px solid #dedede',
                alignItems: "center",
              }}
              // type="button"
              onClick={toggleIsPlaying}
            >
              <div>
                {isPlaying ? <StopIcon/> : <PlayOutlineIcon/>}
              </div>
            </button>
          </>
        }
        content={
          editMode ?  (
            <div>
              <Input value={editContent} onChange={(e) => {
                setEditContent(e.target.value)}
              }/>
              {
                transcript ? (
                  editContent === transcript.content ? (
                    <Button disabled>Save</Button>
                  ) : <Button onClick={() => onSaveTranscript()}>Save</Button>
                ) : (
                  editContent === "..." ? (
                    <Button disabled>Save</Button>
                  ) : (
                    <Button onClick={() => onSaveTranscript()}>Save</Button>
                  )
                ) 
              }
              <Button onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
          ) : (
            <div>
              <p>{transcript ? (
                `${transcript.content} (Fix by ${transcript.fixBy})`
              ): "---"}</p>
              <button style={{backgroundColor: "transparent"}} onClick={() => {
                setEditContent(transcript ? transcript.content : "...")
                setEditMode(true)
              }}><EditOutlined /> Sửa text</button>
            </div>
          )
        }/>
    </>
  )
}
