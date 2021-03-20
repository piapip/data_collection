import React from 'react';

import { Row, Col } from 'antd';
import QuestionMark from './question-mark.png';
import intentInfo from '../Shared/intent';

export default function ProgressNote(props) {

  const currentIntent = props ? props.currentIntent : [];
  
  const getLabel = (slot) => {
    const slotIndex = intentInfo.SLOT_LABEL.findIndex(item => {
      return item.tag.toUpperCase() === slot.toUpperCase();
    })

    return slotIndex === -1 ? "" : intentInfo.SLOT_LABEL[slotIndex].name
  }

  const renderProgressNote = (
    currentIntent.length !== 0 && currentIntent[0][0] !== "generic_intent" ? (
      <Row>
        <Row style={{height: "50px", lineHeight: "50px"}}>
          <Col span={8}>
            <b>Ý định:</b>
          </Col>
          <Col span={16}>
            {intentInfo.INTENT[currentIntent[0][1]].name}
          </Col>
        </Row>
         
        {
          intentInfo.INTENT[currentIntent[0][1]].slot.map((property, index) => {
            const currentIntentIndex = currentIntent.findIndex(item => {
              return item[0] === property;
            })

            return (
              <Row style={{height: "50px", lineHeight: "50px"}} key={index}>
                <Col span={8}>
                  <b>{getLabel(property)}:</b>
                </Col>
                <Col span={16}>
                  {
                    currentIntentIndex !== -1 ? intentInfo[currentIntent[currentIntentIndex][0].toUpperCase()][currentIntent[currentIntentIndex][1]].name : (
                      <img src={QuestionMark} alt="question-mark" style={{height: "50px"}}/>
                    )
                  }
                </Col>
              </Row>
            )
          })
        }
      </Row>
    ) : (
      <p>Chưa có thông tin!!!</p>
    )
  )

  return (
    <>
      {/* <Row>
        <Col>
        </Col>
      </Row> */}
      <Row style={{padding: "10px"}}>
        <h3 style={{fontWeight:'bold',fontSize:'18px',textAlign: "center"}}>Hiện trạng</h3>
        {renderProgressNote}
      </Row>
    </>
  )
}
