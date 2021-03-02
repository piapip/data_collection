import React from 'react';

// import { Row, Col, Steps, Affix } from 'antd';
import { Row, Col, Affix } from 'antd';
import "./Status.css";

// const { Step } = Steps;

export default function Status(props) {

  const message = props ? props.message : "Loading...";
  // const turn = props ? props.turn-1 : 0;
  const userRole = props ? props.userRole : "";

  const convertMessage = (line) => {
    let newLine = line;
    if (userRole === "client") {
      newLine = line.replace("Client", "Bạn");
      newLine = newLine.replace("Servant", "Bạn bên kia");
      newLine = line.replace("client", "bạn");
      newLine = newLine.replace("servant", "bạn bên kia");
    } else if (userRole === "servant") {
      newLine = line.replace("Servant", "Bạn");
      newLine = newLine.replace("Client", "Bạn bên kia");
      newLine = line.replace("servant", "bạn");
      newLine = newLine.replace("client", "bạn bên kia");
    }
    return newLine;
  }

  return (
    <>
      <Affix offsetTop={10}>
        <div style={{paddingTop: "10px", paddingRight: "20px", paddingLeft: "20px", zIndex: "1000"}}>
          <Row>
            <Col style={{textAlign: "center"}}>
              {/* <p className={`glow_${userRole}`}>{message}</p> */}
              <p className={`glow_${userRole}`}>{convertMessage(message)}</p>
            </Col>
          </Row>

          {/* <Steps current={turn}>
            <Step title="Client" description="Client thu âm và gán tag cho audio rồi gửi." />
            <Step title="Servant" description="Servant kiểm tra tag của audio từ Client." />
            <Step title="Servant" description="Servant thu âm và gửi audio của mình." />
          </Steps> */}
        </div>
      </Affix>
    </>
  )
}
