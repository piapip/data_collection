import React, { useState, useEffect } from 'react';
import RecorderJS from 'recorder-js';

import LoadingComponent from './../Loading/LoadingComponent';
import { getAudioStream, exportBuffer } from './audio';
import {MicIcon, StopIcon} from "../../ui/icons";

export default function Recorder(props) {
  const isRecording = props ? props.isRecording : false;
  const turn = props ? props.turn : false;
  const socket = props ? props.socket : null;
  const roomID = props ? props.roomID : "";

  const [ stream, setStream ] = useState(null);
  const [ recorder, setRecorder ] = useState(null);

  // this [] needs to be watched out for.
  useEffect(() => {
    (async () => {
      let stream;

      try {
        stream = await getAudioStream();
      } catch (error) {
        // Users browser doesn't support audio.
        // Add your handler here.
        console.log(error);
      }
  
      setStream(stream);
    })();
  }, []);

  const startRecord = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const recorder = new RecorderJS(audioContext);
    recorder.init(stream);
    props.setIsRecording(true);
    setRecorder(recorder);
    recorder.start()

    if (socket) {
      socket.emit('Recording', {
        roomID,
      });
    }
  }

  const stopRecord = async () => {
    const { buffer } = await recorder.stop()
    const blob = exportBuffer(buffer[0]);
    const blobURL = window.URL.createObjectURL(blob)

    const audio = {
      blob: blob,
      blobURL: blobURL,
    }

    // Process the audio here.
    props.setIsRecording(false)
    props.setAudio(audio);

    if (socket) {
      socket.emit('Done Recording', {
        roomID,
      });
    }
  }

  const renderRecordingButton = (
    turn ? (
      isRecording ? (
        <button onClick={stopRecord} className="primary-button button" type="button">
          <StopIcon/>
        </button> 
      ) : (
        <button onClick={startRecord} className="primary-button button" type="button">
          <MicIcon/>
        </button>
      )
    ) : (
      <button onClick={() => alert("Yo")} style={{cursor: 'not-allowed', width: '88px', height: '88px'}} disabled>
        <MicIcon />
      </button>
    )
  )

  if (!stream ||
    socket === null ||
    roomID === "") {
    return <LoadingComponent />
  }

  return (
    <div>
      <div style={{margin: '4rem auto'}}>
        <div className="primary-button">
          {/* {
            turn ? (
              isRecording ? (
                <button onClick={stopRecord()} className="primary-button button" type="button">
                  <StopIcon/>
                </button> 
              ) : (
                <button onClick={startRecord()} className="primary-button button" type="button">
                  <MicIcon/>
                </button>
              )
            ) : (
              <button onClick={() => alert("Yo")} style={{cursor: 'not-allowed', width: '88px', height: '88px'}} disabled>
                <MicIcon />
              </button>
            )
          } */}
          {/* <button onClick={
            turn ? alert("Yo") :
            isRecording ? stopRecord : startRecord
          } className="primary-button button" type="button">
            {isRecording ? <StopIcon /> : <MicIcon />}
          </button> */}
          {renderRecordingButton}
          <div className="primary-button background"/>
        </div>
      </div>
      
    </div>
  )
}
