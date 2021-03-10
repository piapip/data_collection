import React, { useState, useEffect } from 'react';

// import { Input, Row, Col } from 'antd';
import { Row, Col } from 'antd';
import LoadingComponent from './../../../Loading/LoadingComponent';
import QuestionMark from './question-mark.png';

// const { Title, Paragraph } = Typography;
// const { TextArea } = Input;

export default function ProgressNote(props) {

  const scenario = props ? props.scenario : [];
  const progress = props ? props.progress : [];
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    if (scenario !== [] && progress !== []) {
      setLoading(false);
    } else setLoading(true);
  }, [scenario, progress]);

  const LABEL = ["Hành động", "Thiết bị", "Tầng", "Phòng", "Scale", "Level"]

  // let renderProgress = ""
  // progress.map((property, index) => {
  //   if (property[1] >= 1) {
  //     return (
  //       renderProgress = renderProgress + `${LABEL[index]}: ${scenario[index][1]}\n`
  //     )
  //   } else {
  //     return "";
  //   }
  // })

  // const renderProgressNew = (
  //   progress.map((property, index) => {
  //     if (property[1] >=  1) {
  //       return (
  //         <div></div>
  //       )
  //     }
  //   })
  // )

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <>
      {/* <h3 style={{textAlign: "center"}}>Ghi chú công việc đã làm được</h3> */}
      {/* <h3 style={{fontWeight:'bold', fontSize:'18px', textAlign: "center"}}>Ghi chú</h3>
      {
        loading ? <LoadingComponent /> :
        (
        <TextArea 
          readOnly
          // style={{height: "200px", background: "transparent", border: "none"}}
          style={{height: "200px"}}
          spellCheck={false}
          value={renderProgress === "" ? "Chưa xác định được bất kì mục tiêu nào!" : renderProgress} />
        )
      } */}
      <Row style={{padding: "10px"}}>
        <Col xs={24} xl={15}>
          <Row style={{height: "50px", lineHeight: "50px"}}>
            <Col span={8}>
              <b>{LABEL[1]}</b> <span style={{color: "red"}}>*</span>:
            </Col>
            <Col span={16}>
              {
                progress.length !== 0 ? (
                  // this is the progress property
                  progress[1][1] > 0 ? scenario[1][1] : <img src={QuestionMark} alt="question-mark" style={{height: "50px"}}/>
                ) : ""
              }
            </Col>
          </Row>

          <Row style={{height: "50px", lineHeight: "50px"}}>
            <Col span={8}>
              <b>{LABEL[0]}</b> <span style={{color: "red"}}>*</span>:
            </Col>
            <Col span={16}>
              {
                progress.length !== 0 ? (
                  // this is the progress property
                  progress[0][1] > 0 ? scenario[0][1] : <img src={QuestionMark} alt="question-mark" style={{height: "50px"}}/>
                ) : ""
              }
            </Col>
          </Row>

          <Row style={{height: "50px", lineHeight: "50px"}}>
            <Col span={8}>
              <b>{LABEL[3]}</b> <span style={{color: "red"}}>*</span>:
            </Col>
            <Col span={16}>
              {
                progress.length !== 0 ? (
                  // this is the progress property
                  progress[3][1] > 0 ? scenario[3][1] : <img src={QuestionMark} alt="question-mark" style={{height: "50px"}}/>
                ) : ""
              }
            </Col>
          </Row>

          <Row style={{height: "50px", lineHeight: "50px"}}>
            <Col span={8}>
              <b>{LABEL[2]}</b> <span style={{color: "red"}}>*</span>:
            </Col>
            <Col span={16}>
              {
                progress.length !== 0 ? (
                  // this is the progress property
                  progress[2][1] > 0 ? scenario[2][1] : <img src={QuestionMark} alt="question-mark" style={{height: "50px"}}/>
                ) : ""
              }
            </Col>
          </Row>
        </Col>

        <Col xs={24} xl={9}>
          <Row style={{height: "50px", lineHeight: "50px"}}>
            <Col xl={6} xs={8}>
              <b>{LABEL[4]}</b>:
            </Col>
            <Col xl={18} xs={16}>
              {
                progress.length !== 0 ? (
                  // this is the progress property
                  progress[4][1] > 0 ? scenario[4][1] : <img src={QuestionMark} alt="question-mark" style={{height: "50px"}}/>
                ) : ""
              }
            </Col>
          </Row>

          <Row style={{height: "50px", lineHeight: "50px"}}>
            <Col xl={6} xs={8}>
              <b>{LABEL[5]}</b>:
            </Col>
            <Col xl={18} xs={16}>
              {
                progress.length !== 0 ? (
                  // this is the progress property
                  progress[5][1] > 0 ? scenario[5][1] : <img src={QuestionMark} alt="question-mark" style={{height: "50px"}}/>
                ) : ""
              }
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}
