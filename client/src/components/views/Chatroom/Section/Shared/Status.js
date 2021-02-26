import React from 'react';

import { Row, Col, Steps } from 'antd';

const { Step } = Steps;

export default function Status(props) {

  const message = props ? props.message : "Loading...";
  const turn = props ? props.turn-1 : 0;

  return (
    <>
      <div style={{paddingTop: "10px", paddingRight: "20px", paddingLeft: "20px"}}>

        <Row>
          <Col style={{textAlign: "center"}}>
            <p>{message}</p>
          </Col>
        </Row>

        <Steps current={turn}>
          <Step title="Client" description="Client thu âm và gán tag cho audio rồi gửi." />
          <Step title="Servant" description="Servant kiểm tra tag của audio từ Client." />
          <Step title="Servant" description="Servant thu âm và gửi audio của mình." />
        </Steps>
      </div>
    </>
  )
}
