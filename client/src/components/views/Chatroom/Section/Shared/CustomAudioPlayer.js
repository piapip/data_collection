import React, { useState, useRef } from 'react'

import { Tooltip } from 'antd';

import LoadingComponent from './../../../Loading/LoadingComponent';
import { PlayOutlineIcon, StopIcon } from '../../../../ui/icons';

export default function CustomAudioPlayer(props) {

  const audioLink = props ? props.audioLink : "";  
  const autoPlay = props ? props.autoPlay : false;
  const audioRef = useRef(null);
  const [ isPlaying, setIsPlaying ] = useState(false);

  const tooltipPlay = <span>Play</span>;

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
      <div className="pill">
        <div className="pill done">
          <div className="pill done contents">
            <audio 
              key={audioLink}
              autoPlay={autoPlay}
              preload="auto" 
              onEnded={toggleIsPlaying} 
              ref={audioRef}>
              <source src={audioLink} type={getAudioFormat()}/>
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
            
          </div>
        </div>
      </div>
      
    </>
    
  )
}
