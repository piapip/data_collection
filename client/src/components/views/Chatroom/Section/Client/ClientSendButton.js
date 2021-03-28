import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import RejectAudioButton from '../Shared/RejectAudioButton';
import LoadingComponent from '../../../Loading/LoadingComponent';

import { getTranscript, saveAudio } from '../../../../../_actions/audio_actions';
import { updateRoom } from '../../../../../_actions/chatroom_actions';

import { UPLOAD_API } from '../../../../Config';

export default function ClientSendButton(props) {

  const data = props ? props.audio : null;
  const userRole = props ? props.userRole : "";
  const userID = props ? props.userID : "";
  const roomID = props ? props.roomID : "";
  const roomName = props ? props.roomName : "";
  const intent = props ? props.intent : null;
  const socket = props ? props.socket : null;
  const buttonDisable = props ? props.disable : true;
  const turn = props ? props.turn : -1;
  const rejectButtonDisabled = props ? props.rejectButtonDisabled : true;
  const dispatch = useDispatch();

  const audioName = props ? props.audioName : "test.wav";

  const [ buttonState, setButtonState ] = useState(false);
  const [ buttonPhase, setButtonPhase ] = useState(0);

  const validateIntent = () =>{
    if (!intent) return false;

    if (intent.four_last_digits) {
      const re = '^[0-9]+$';
      if (intent.four_last_digits.length !== 4 || !(new RegExp(re).test(intent.four_last_digits))) return false;
    }

    if (intent.cmnd) {
      const re = '^[0-9]+$';
      if (!(new RegExp(re).test(intent.cmnd))) return false;
    }

    return true;
  }

  const uploadAudioAWS = async (e) => {

    // create data
    let formdata = new FormData();
    formdata.append('destination', roomName);
    formdata.append('name', audioName);
    formdata.append('soundBlob', data.blob, `${roomName}/${audioName}`);
    // formdata.append('userID', userID);
    // formdata.append('roomID', roomID);
     
    const requestConfig = {     
      headers: new Headers({
        enctype: "multipart/form-data"
      })
    };
    
    try {
      setButtonPhase(1);
      setButtonState(true);
      await axios.post(
        // '/api/aws/upload',
        UPLOAD_API,
        formdata,
        requestConfig,
      ).then(res => {
        // props.sendAudioSignal(res.data.data.Location);
        if (res.data.status === 1) {
          setButtonPhase(2);
          const audioLink = res.data.result.link;
          dispatch(saveAudio(userID, audioLink))
          .then((response) => {
            // update room audioList in the db
            const audioID = response.payload.audioID;
            dispatch(updateRoom(roomID, audioID))
            .then(response => {
              if (!response.payload.success) {
                // IMPLEMENT WARNING OVER HERE!!!!
                setButtonState(false);
                setButtonPhase(0);
              }
            });
            // tell the server that thing's are ready to move on.
            props.sendAudioSignal(audioLink);
            // get transcript
            dispatch(getTranscript(audioLink, audioID))
            .then(() => {
              setButtonState(false);
              setButtonPhase(0);
              if (socket) {
                socket.emit('client intent', {
                  roomID: roomID,
                  audioID: audioID,
                  intentDetailed: intent,
                });
              }
            });
          })
        } else {
          // IMPLEMENT WARNING OVER HERE!!!!
          setButtonState(false);
          setButtonPhase(0);
        }
      })

    } catch(error){
      alert(error);
    }
  }

  const insertButton = (data !== null && turn === 1) ? (
    (buttonDisable || !validateIntent()) ? (
      // Can put an alert instead of a Popover but it looks stupid as fuck
      <button className="buttons" style={{cursor: 'not-allowed'}} disabled>Gửi</button>
    ) : (
      buttonState ? (
        <button className="buttons" style={{ cursor: 'not-allowed', display: "flex", alignItems: "center", padding: "10px" }} disabled><LoadingComponent style={{paddingRight: "2px"}}/> {
          buttonPhase === 0 ? "Gửi" :
          buttonPhase === 1 ? "Xử lý audio..." :
          buttonPhase === 2 ? "Lấy transcript..." : "????HOWWWW???"
        }</button>
      ) : (
        <button className="buttons" onClick={uploadAudioAWS}>{
          buttonPhase === 0 ? "Gửi" :
          buttonPhase === 1 ? "Xử lý audio..." :
          buttonPhase === 2 ? "Lấy transcript..." : "????HOWWWW???"
        }</button>  
      )
    )
  ) : (
    (turn === 1) ? (
      <RejectAudioButton 
        socket={socket}
        roomID={roomID}
        userRole={userRole}
        disabled={rejectButtonDisabled}/>
    ) : ""
  )

  return (
    <>
      {insertButton}
    </>    
  )
}
