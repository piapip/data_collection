import React, { useEffect, useRef } from 'react';

// import { Col, Row, List } from "antd";
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
                  <Grid container 
                    style={{ margin: "10px 5px" }} 
                    justify={((userRole === "client" && index % 2 === 0) || (userRole === "servant" && index % 2 === 1)) ? "flex-end" : "flex-start"}>
                    <AudioPlayerWithTranscript
                      index={index}
                      offset={((userRole === "client" && index % 2 === 0) || (userRole === "servant" && index % 2 === 1)) ? "left" : "right"}
                      socket={socket}
                      roomID={roomID}
                      userID={userID}
                      username={username}
                      audioRole={index % 2 === 0 ? "Client" : "Servant"}
                      audioLink={audio}
                      transcript={transcript[index]}/>
                  </Grid>
                </div>
              )
            })
          }
        </Grid>
      </Grid>
      <div ref={audioEndRef}/>
      
      {/* <Row style={{marginLeft: "10px", marginRight: "10px", paddingBottom: "10px"}}>
        <Col>
          <List
            itemLayout="horizontal"
            dataSource={audioList}
            renderItem={(audio, index) => {
              return (
                <div key={`audio_${index}`}>
                  <Row style={{
                    fontWeight: 'bold',
                    flexGrow: '1'}}>
                    <Col span={12} offset={((userRole === "client" && index % 2 === 0) || (userRole === "servant" && index % 2 === 1)) ? 12 : 0}>
                      <AudioPlayerWithTranscript
                        index={index}
                        socket={socket}
                        roomID={roomID}
                        userID={userID}
                        username={username}
                        audioRole={index % 2 === 0 ? "Client" : "Servant"}
                        audioLink={audio}
                        autoPlay={false}
                        transcript={transcript[index]}/>
                    </Col>
                  </Row>
                </div>
              )
            }}>
          </List>
        </Col>
        
        <div ref={audioEndRef}/>
      </Row> */}
    </div>
  )
}