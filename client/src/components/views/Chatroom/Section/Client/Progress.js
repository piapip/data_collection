import React, { useState, useEffect } from 'react';

import { Row, Col } from 'antd';
import CorrectSign from './green-correct-sign.png';
import RedCrossSign from './red-cross-sign.png';

import LoadingComponent from './../../../Loading/LoadingComponent';

import intentInfo from './../Shared/intent';

export default function Progress(props) {

  const scenario = props ? props.scenario : [];
  const currentIntent = props ? props.currentIntent : [];
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    if (scenario.length !== 0) {
      setLoading(false);
    } else setLoading(true);
  }, [scenario])

  const compareProperty = (scenarioProp, currentIntent) => {
    // if (!scenarioProp) return false;
    // if (!currentIntent || currentIntent.length === 0) return false;
    // const scenarioPropIndex = currentIntent.findIndex(item => {
    //   return item[0] === scenarioProp[0];
    // })

    // if (scenarioPropIndex === -1) return false;
    // else {
    //   if (scenarioProp[1] === "-1" && currentIntent[scenarioPropIndex][1]) return true;
    //   else {
    //     if (scenarioProp[1] === currentIntent[scenarioPropIndex][1]) return true;
    //     return false;
    //   }
    // }

    if (!scenarioProp) return false;
    if (!currentIntent || currentIntent.length === 0) return null;
    const scenarioPropIndex = currentIntent.findIndex(item => {
      return item[0] === scenarioProp[0];
    })

    if (scenarioPropIndex === -1) return null;
    else {
      if (scenarioProp[1] === "-1" && currentIntent[scenarioPropIndex][1]) return currentIntent[scenarioPropIndex][1];
      else {
        if (scenarioProp[1] === currentIntent[scenarioPropIndex][1]) return currentIntent[scenarioPropIndex][1];
        return null;
      }
    }
    
  }

  const getLabel = (slot) => {
    const slotIndex = intentInfo.SLOT_LABEL.findIndex(item => {
      return item.tag.toUpperCase() === slot.toUpperCase();
    })

    return slotIndex === -1 ? "" : intentInfo.SLOT_LABEL[slotIndex].name
  }

  const renderProgress = (
    (scenario && scenario.length !== 0) ? (
      scenario.map((property, index) => {
        const slotValue = compareProperty(property, currentIntent);
        return slotValue ? (
          <Col xl={6} xs={24} key={property[0]}>
            <Row style={{textAlign: "center"}}>
              {index === 0 ? "Ý định" : getLabel(property[0])}
            </Row>
            <Row style={{textAlign: "center"}}>
              <img src={CorrectSign} alt="done" style={{height: "50px"}}/>
            </Row>
            <Row style={{textAlign: "center"}}>
              {property[1] === "-1" ? slotValue : intentInfo[property[0].toUpperCase()][slotValue].name}
            </Row>
          </Col>
        ) : (
          <Col xl={6} xs={24} key={property[0]}>
            <Row style={{textAlign: "center"}}>
              {getLabel(property[0])}
            </Row>
            <Row style={{textAlign: "center"}}>
              <img src={RedCrossSign} alt="not done" style={{height: "50px"}}/>
            </Row>
            <Row style={{textAlign: "center"}}>
              {property[1] === "-1" ? "?" : intentInfo[property[0].toUpperCase()][property[1]].name}
            </Row>
          </Col>
        )
      })
    ) : <LoadingComponent />
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
