import React from 'react';

import { Row, Col } from 'antd';
// import LoadingComponent from './../../../Loading/LoadingComponent';
import QuestionMark from './question-mark.png';
import intentInfo from '../Shared/intent';

export default function ProgressNote(props) {

  // const scenario = props ? props.scenario : [];
  const currentIntent = props ? props.currentIntent : [];
  // const [ loading, setLoading ] = useState(true);

  console.log("currentIntent: ", currentIntent);

  console.log(currentIntent.length !== 0 ? intentInfo.INTENT[currentIntent[0][1]] : "");

  // useEffect(() => {
  //   if (scenario !== []) {
  //     setLoading(false);
  //   } else setLoading(true);
  // }, [scenario]);

  // if (loading) {
  //   return <LoadingComponent />
  // }

  const renderProgressNote = (
    currentIntent.length !== 0 ? (
      <Row>
        <Row style={{height: "50px", lineHeight: "50px"}}>
          <Col span={6}>
            <b>Ý định:</b>
          </Col>
          <Col span={18}>
            {intentInfo.INTENT[currentIntent[0][1]].name}
          </Col>
        </Row>
         
        {
          intentInfo.INTENT[currentIntent[0][1]].slot.map((property, index) => {
            const currentIntentIndex = currentIntent.findIndex(item => {
              return item[0] === property;
            })

            return (
              <Row style={{height: "50px", lineHeight: "50px"}}>
                <Col span={6}>
                  <b>{property}:</b>
                </Col>
                <Col span={18}>
                  {
                    currentIntentIndex !== -1 ? currentIntent[currentIntentIndex][1] : (
                      <img src={QuestionMark} alt="question-mark" style={{height: "50px"}}/>
                    )
                  }
                </Col>
              </Row>
            )
          })
        }
      </Row>
      
    ) : ""
  )

  return (
    <>
      <Row style={{padding: "10px"}}>
        {renderProgressNote}
      </Row>
    </>
  )
}
