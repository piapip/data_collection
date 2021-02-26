import React, { useState, useRef, useEffect } from 'react';
import  { Link } from "react-router-dom";

import { Button, Row, Col } from 'antd';

export default function ReadyButton(props) {
  
  const isAuth = props ? props.isAuth : false;
  const [ timer, setTimer ] = useState(0);
  const increment = useRef(null);

  useEffect(() => {
    // seems redundant but need it. So when the user denies their second queue confirmation, we'll reset the timer.
    if (!props.readyStatus) {
      clearInterval(increment.current);
      setTimer(0);
    }
  }, [ props.readyStatus ])

  const ready = () => {
    props.readySignal()
    // start counting
    increment.current = setInterval(() => {
      setTimer((timer) => timer + 1)
    }, 1000)
  }

  const cancelReady = () => {
    props.cancelReadySignal()
    // stop counting
    clearInterval(increment.current);
    setTimer(0);
  }

  const timeConverter = (seconds) => {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60

    return [hours, minutes, seconds % 60].map(format).join(':')
  }

  return (
    <>
      <Row 
        type="flex"
        style={{ alignItems: "center", marginTop: "7px", marginBottom: "7px" }}
        justify="center"
        gutter={10}>
        <Col style={{textAlign: "center"}}>
          {isAuth ? (
            !props.readyStatus ? (
              <Button shape="round" onClick={ready} style={{marginTop: "45px", marginBottom: "45px"}}>Sẵn sàng</Button>
            ) : (
              <div style={{marginTop: "45px", marginBottom: "45px"}}>
                <Row>
                  <Button shape="round" onClick={cancelReady}>
                    Dừng tìm kiếm
                  </Button>
                </Row>
                <Row>
                  Đang tìm bạn: {timeConverter(timer)}
                </Row>
                
                
              </div>
              
            )) : (
              <Link to={`/login`}>
                <Button shape="round" style={{marginTop: "45px", marginBottom: "45px"}}>Sẵn sàng</Button>
              </Link>
            )
          }
        </Col>
      </Row>
      
      {/* {
        props.readyStatus ? (
          <Row>
            <Col>
              Đang tìm bạn: {timeConverter(timer)}
            </Col>
          </Row>    
        ) : ""
      } */}
      
    </>
  )
}
