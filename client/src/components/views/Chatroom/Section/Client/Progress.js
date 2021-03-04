import React, { useState, useEffect } from 'react';

// import { Collapse, Row, Col } from 'antd';
import { Row, Col } from 'antd';
import CorrectSign from './green-correct-sign.png';
import RedCrossSign from './red-cross-sign.png';
// import { CheckCircleTwoTone, MinusCircleTwoTone } from '@ant-design/icons';

import LoadingComponent from './../../../Loading/LoadingComponent';

// const { Panel } = Collapse;

export default function Progress(props) {

  const scenario = props ? props.scenario : [];
  const progress = props ? props.progress : [];
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    if (progress.length !== 0 && scenario.length !== 0) {
      setLoading(false);
    } else setLoading(true);
  }, [progress, scenario])

  // const renderProgress = (
  //   progress.length !== 0 ? progress.map(property => {
  //     if (property[1] >= 1) {
  //       return (
  //         <Col span={4} key={property[0]} style={{alignItems: "center"}}>
  //           <CheckCircleTwoTone twoToneColor="#52c41a"/>
  //         </Col>
  //       )
  //     } else if (property[1] === 0) {
  //       return (
  //         <Col span={4} key={property[0]} style={{alignItems: "center", textAlign: "center"}}>
  //           <MinusCircleTwoTone twoToneColor="#eb2f96"/>
  //         </Col>
  //       )
  //     } else {
  //       return "";
  //     }
  //   }) : ""
  // );

  const renderProgress = (
    (scenario && progress) ? (progress.length !== 0 && scenario.length !== 0) ? (
      progress.map((property, index) => {
        return property[1] >= 1 ? (
          <Col xl={12} xs={24} key={property[0]}>
            <img src={CorrectSign} alt="done" style={{height: "50px"}}/> {scenario[index][1]}
          </Col>
        ) : property[1] === 0 ? (
          <Col xl={12} xs={24} key={property[0]}>
            <img src={RedCrossSign} alt="not done" style={{height: "50px"}}/> {scenario[index][1]}
          </Col>
        ) : ""
        
      })
    ) : "" : <LoadingComponent />
  )

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <>
      {/* <Collapse defaultActiveKey={['progress']}>
        <Panel header="Tiến trình hoàn thành: " key="progress">
          <Row justify="center" align="middle">
            {renderProgress}
          </Row>
        </Panel>
      </Collapse> */}
      <Row style={{height: "50px", lineHeight: "50px"}}>
        {renderProgress}
      </Row>
    </>
  )
}
