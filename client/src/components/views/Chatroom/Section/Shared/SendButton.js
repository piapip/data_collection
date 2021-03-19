import React, { useState } from 'react'
import axios from 'axios'

export default function Test(props) {

  const [ buttonState, setButtonState ] = useState(false);

  const data = props ? props.audio : null;
  const userID = props ? props.userID : "";
  const roomID = props ? props.roomID : "";
  // const intent = props ? props.intent : []

  const uploadAudio = async (e) => {

    // create data
    let formdata = new FormData()
    formdata.append('soundBlob', data.blob, 'test.wav')
    formdata.append('userID', userID)
    formdata.append('roomID', roomID)
     
    const requestConfig = {     
      headers: new Headers({
        enctype: "multipart/form-data"
      })
    }
    
    try {
      setButtonState(true);
      await axios.post(
        '/api/upload/file',
        formdata,
        requestConfig,
      ).then(res => {
        props.sendAudioSignal(res.data.link);
        setButtonState(false);
        console.log(res.data.link);
      })
    } catch(error){
        alert(error);
    }
  }

  const insertButton = data !== null ? (
    <button className="buttons" onClick={uploadAudio} disabled={buttonState}>Gửi</button>
    // <button className="buttons" onClick={uploadAudioAWS}>Gửi</button>
  ) : ""

  return (
    <>
      {insertButton}
    </>    
  )
}
