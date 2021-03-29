import React, { useEffect, useRef } from 'react';

import Grid from '@material-ui/core/Grid';
import AudioPlayerWithTranscript from './AudioPlayerWithTranscript';

export default function AudioList(props) {

  const transcript = props ? props.transcript : [];
  const audioList = props ? props.audioList : [];
  const userRole = props ? props.userRole : "";
  const audioEndRef = useRef(null);

  let socket = props ? props.socket : null;
  const roomID = props ? props.roomID : "";
  const userID = props ? props.userID : "";
  const username = props ? props.username : "";
  
  const scrollToBottom = () => {
    audioEndRef.current.scrollIntoView({ behaviour: "smooth", block: 'nearest', inline: 'start' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [audioList.length]);

  return (
    <div
      style={{
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between",
        height: "calc(100vh - 119px)",
        backgroundColor: "white",
        overflowX: "hidden",
        overflowY: "scroll",
        paddingLeft: "10px",
        paddingRight: "20px",
      }}
    >
      <Grid container>
        <Grid item sm={12}>
          {
            audioList.map((audio, index) => {
              return (
                <div key={`audio_${index}`}>
                  <AudioPlayerWithTranscript
                    index={index}
                    backgroundColor={index % 2 === 0 ? "#FABFC6" : "#D5F8DC"}
                    offset={((userRole === "client" && index % 2 === 0) || (userRole === "servant" && index % 2 === 1)) ? "left" : "right"}
                    socket={socket}
                    roomID={roomID}
                    userID={userID}
                    username={username}
                    audioRole={index % 2 === 0 ? "Client" : "Servant"}
                    audioLink={audio}
                    transcript={transcript[index]}/>
                </div>
              )
            })
          }
        </Grid>
      </Grid>
      <div ref={audioEndRef}/>
    </div>
  )
}