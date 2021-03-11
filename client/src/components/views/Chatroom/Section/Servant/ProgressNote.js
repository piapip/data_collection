import React, { useState, useEffect } from 'react';

import { Row, Col } from 'antd';
import LoadingComponent from './../../../Loading/LoadingComponent';
import QuestionMark from './question-mark.png';
import { COLOR } from './../../../../Config';

export default function ProgressNote(props) {

  const scenario = props ? props.scenario : [];
  const progress = props ? props.progress : [];
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    if (scenario !== [] && progress !== []) {
      setLoading(false);
    } else setLoading(true);
  }, [scenario, progress]);

  const LABEL = ["Hành động", "Thiết bị", "Tầng", "Phòng", "Scale", "Level"];

  if (loading) {
    return <LoadingComponent />
  }

  const renderProgressNote = (
    (progress.length !== 0 && scenario.length !== 0) ? (
      progress.map((property, index) => {
        return (
          <Col xs={24} xl={12} key={property[0]}>
            <Row style={{height: "50px", lineHeight: "50px"}}>
              <Col span={8}>
                <b>{LABEL[index]}</b>:
              </Col>
              <Col span={16}>
                {
                  
                  property[1] > 0 ? (
                    index !== 5 ? scenario[index][1] : (
                      scenario[4][1] === "Màu" ? COLOR[scenario[index][1] + 1] : scenario[index][1]
                    )
                  ) : <img src={QuestionMark} alt="question-mark" style={{height: "50px"}}/>
                }
              </Col>
            </Row>
          </Col>
        )  
      })
    ) : (
      <LoadingComponent />
    )
  )

  return (
    <>
      <Row style={{padding: "10px"}}>
        {renderProgressNote}
      </Row>
    </>
  )
}
