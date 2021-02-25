import React, { useState, useEffect } from 'react';
import { Collapse, Row, Col } from 'antd';
import { CheckCircleTwoTone, MinusCircleTwoTone } from '@ant-design/icons';

import LoadingComponent from './../../../Loading/LoadingComponent';

const { Panel } = Collapse;

export default function Progress(props) {

  const progress = props ? props.progress : [];
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    if (progress !== []) {
      setLoading(false);
    } else setLoading(true);
  }, [progress])

  const renderProgress = (
    progress.map(property => {
      if (property[1] >= 1) {
        return (
          <Col span={4} key={property[0]} style={{alignItems: "center"}}>
            <CheckCircleTwoTone twoToneColor="#52c41a"/>
          </Col>
        )
      } else if (property[1] === 0) {
        return (
          <Col span={4} key={property[0]} style={{alignItems: "center", textAlign: "center"}}>
            <MinusCircleTwoTone twoToneColor="#eb2f96"/>
          </Col>
        )
      } else {
        return "";
      }
    })
  );

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <>
      <Collapse defaultActiveKey={['progress']}>
        <Panel header="Tiến trình hoàn thành: " key="progress">
          <Row justify="center" align="middle">
            {renderProgress}
          </Row>
        </Panel>
      </Collapse>
    </>
  )
}
