import React from 'react';
import { Row, Col } from 'antd';

export default function Status(props) {

  const message = props ? props.message : "Loading...";

  return (
    <Row>
      <Col style={{textAlign: "center"}}>
        <p>{message}</p>
      </Col>
    </Row>
  )
}
