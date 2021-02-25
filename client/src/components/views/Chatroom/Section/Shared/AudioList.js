import React from 'react'
import { Col, Row } from "antd";

import CustomAudioPlayer from './CustomAudioPlayer';
import LoadingComponent from './../../../Loading/LoadingComponent';

export default function AudioList(props) {

  const showAudio = props ? (
    props.audioList ? props.audioList.map((audio, index) => {
    // audioList ? audioList.map((audio, index) => {
      return (
        // <div key={audio}>
        //   <audio
        //     controls="controls"
        //     src={audio}>
        //   <track kind="captions"/>
        //   </audio>
        // </div>
        <div key={`audio_${index}`}>
          <Row style={{marginTop: "3px", marginBottom: "3px"}}>
            <Col span={2}>
              {
                index % 2 === 0 ? "C" : "S"
              }
            </Col>
            <Col span={22}>
              <CustomAudioPlayer audioLink={audio} autoPlay={false}/>
            </Col>
          </Row>
        </div>
      )
    }) : "") : ""

  if (!props) {
    return <LoadingComponent />
  }

  return (
      <div style={{display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%"}}>
       {/* <div style={{display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%"}}> */}
        <Row style={{fontWeight: 'bold', border: "1px solid white", flexGrow: '1',backgroundColor:"white", alignItems: "left"}}>
          <Col span={24} style={{textAlign: "center",fontsize:"18px"}}>Lịch sử hội thoại</Col>
          {/* <Row align="middle"> */}
            {showAudio}
          {/* </Row> */}
        </Row>
      </div>
  )
}
