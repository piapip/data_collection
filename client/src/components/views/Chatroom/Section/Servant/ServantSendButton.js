import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import { getTranscript } from '../../../../../_actions/audio_actions';

import RejectAudioButton from './../Shared/RejectAudioButton';
import LoadingComponent from './../../../Loading/LoadingComponent';

export default function ServantSendButton(props) {

  const [ buttonState, setButtonState ] = useState(false);
  const [ buttonPhase, setButtonPhase ] = useState(0);

  const data = props ? props.audio : null;
  const roomDone = props ? props.roomDone : null;
  const userRole = props ? props.userRole : "";
  const userID = props ? props.userID : "";
  const roomID = props ? props.roomID : "";
  const roomName = props ? props.roomName : "";
  const turn = props ? props.turn : -1;
  const socket = props ? props.socket : null;
  const rejectButtonDisabled = props ? props.rejectButtonDisabled : true;
  const intent = props ? props.intent : {
    device: null,
    room: null,
    action: null,
    scale: null,
    floor: null,
    level: null,
  };
  const dispatch = useDispatch();

  const audioName = props ? props.audioName : "test.wav";

  const uploadAudioAWS = async (e) => {

    // create data
    let formdata = new FormData();
    formdata.append('destination', roomName);
    formdata.append('soundBlob', data.blob, audioName);
    formdata.append('userID', userID);
    formdata.append('roomID', roomID);
     
    const requestConfig = {     
      headers: new Headers({
        enctype: "multipart/form-data"
      })
    }
    
    try {
      setButtonPhase(1);
      setButtonState(true);
      await axios.post(
        // `${BACKEND_URL}/api/aws/upload`,
        // '/api/aws/upload',
        '/api/upload/file',
        formdata,
        requestConfig,
      ).then(res => {
        setButtonPhase(2);
        const audioLink = res.data.link;
        const audioID = res.data.audioID;
        // props.sendAudioSignal(res.data.data.Location);
        props.sendAudioSignal(audioLink);
        dispatch(getTranscript(audioLink, audioID))
        .then(() => {
          setButtonState(false);
          setButtonPhase(0);
          const audioID = res.data.audioID;
          if (socket) {
            socket.emit('servant audio', {
              roomID,
              audioID,
            });
          }
        })
      })
    } catch(error){
      alert(error)
    }
  }

  // need intent sending button
  const onConfirm = async () => {
    // await setButtonState(true);
    if (socket) {
      await socket.emit('servant intent', {
        roomID: roomID,
        // audioID,
        intentDetailed: intent,
      });
    }
    // setButtonState(false);
  }

  // const insertSendIntentButton = 

  const insertSendButton = (turn === 3 && data !== null) ? (
    buttonState ? (
      <button className="buttons" style={{cursor: 'not-allowed'}} disabled><LoadingComponent /> {
        buttonPhase === 0 ? "Gửi" :
        buttonPhase === 1 ? "Xử lý audio..." :
        buttonPhase === 1 ? "Lấy transcript..." : "????HOWWWW???"
      }</button>
    ) : (
      roomDone ? (
        <button className="buttons" disabled={roomDone || buttonState}>Gửi</button>
      ) : (
        <button className="buttons" onClick={uploadAudioAWS} disabled={roomDone || buttonState}>{
          buttonPhase === 0 ? "Gửi" :
          buttonPhase === 1 ? "Xử lý audio..." :
          buttonPhase === 1 ? "Lấy transcript..." : "????HOWWWW???"
        }</button>
      )
    )
    
  ) : (turn === 2 ? (
    <div>
      <RejectAudioButton
        roomID={roomID}
        userRole={userRole} 
        socket={socket}
        disabled={rejectButtonDisabled}/>
      <button className="buttons" onClick={onConfirm} disabled={roomDone || buttonState}>Xác nhận</button>
    </div>
    
  ) : "")

  return (
    <>
      {insertSendButton}
    </>   
  )
}
