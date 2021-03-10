import React, { useState, useEffect } from 'react';

import { Row, Col } from 'antd';
import CorrectSign from './green-correct-sign.png';
import RedCrossSign from './red-cross-sign.png';

import LoadingComponent from './../../../Loading/LoadingComponent';

export default function Progress(props) {

  const scenario = props ? props.scenario : [];
  const progress = props ? props.progress : [];
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    if (progress.length !== 0 && scenario.length !== 0) {
      setLoading(false);
    } else setLoading(true);
  }, [progress, scenario])

  const renderProgress = (
    (scenario && progress) ? (progress.length !== 0 && scenario.length !== 0) ? (
      progress.map((property, index) => {
        return property[1] >= 1 ? (
          <Col xl={4} xs={24} key={property[0]}>
            <Row style={{textAlign: "center"}}>
              <img src={CorrectSign} alt="done" style={{height: "50px"}}/>
            </Row>
            <Row style={{textAlign: "center"}}>
              {scenario[index][1]}
            </Row>
          </Col>
        ) : property[1] === 0 ? (
          <Col xl={4} xs={24} key={property[0]}>
            <Row style={{textAlign: "center"}}>
              <img src={RedCrossSign} alt="not done" style={{height: "50px"}}/>
            </Row>
            <Row style={{textAlign: "center"}}>
              {scenario[index][1]}
            </Row>
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
      <Row style={{height: "50px", lineHeight: "50px"}}>
        {renderProgress}
      </Row>
    </>
  )
}
