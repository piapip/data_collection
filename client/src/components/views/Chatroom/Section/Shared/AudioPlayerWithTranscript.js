import React, { useState, useRef } from 'react';

import { Comment } from 'antd';

import LoadingComponent from './../../../Loading/LoadingComponent';
import { PlayOutlineIcon, StopIcon } from '../../../../ui/icons';

export default function AudioPlayerWithTranscript(props) {

  const audioLink = props ? props.audioLink : "";
  const audioRole = props ? props.audioRole : "Loading..."; 
  const autoPlay = props ? props.autoPlay : false;
  let transcript = props ? props.transcript : {};

  if (transcript.content === "" || transcript.content === " ") transcript.content = "...";

  const audioRef = useRef(null);
  const [ isPlaying, setIsPlaying ] = useState(false);

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

  if (audioLink === undefined || audioLink === null) return "";

  if (audioLink === "") {
    return <LoadingComponent />
  }

  return (
    <>
      <Comment
        author={transcript.yours ? <p>You</p> : <p>{audioRole}</p>}
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
                border: '1px solid #dedede',
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
          <p>{transcript.content}</p>
        }/>
    </>
  )
}
