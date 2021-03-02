import React, { useState, useEffect } from 'react'
// import { Checkbox, Collapse, Row, Col } from 'antd';
import { Checkbox, Radio, Row, Col } from 'antd';

import LoadingComponent from './../../../Loading/LoadingComponent';
import { COLOR } from './../../../../Config';
import './ClientCheckbox.css'

// const {Panel} = Collapse

export default function ClientCheckbox(props) {

  const list = props ? props.list : []
  const progress = props ? props.progress : [];
  const visible = props ? props.visible : true;
  const disabled = props ? props.disabled : false;
  const [ loading, setLoading ] = useState(true);
  const [ radioValue, setRadioValue ] = useState(1);

  useEffect(() => {
    if (list !== [] && progress !== []) {
      setLoading(false);
    } else setLoading(true);
  }, [list, progress])

  // update label for color criteria
  if(list) {
    if(list[4]) {
      if(list[4][2].toLowerCase() === 'màu') {
        if (list[5]) {
          list[5][1] = COLOR[list[5][2] + 1]
        }
      }
    }
  }

  const getValueFromKey = (key) => {
    for (const item of list) {
      if (item[0] === key) return item[2]
    }

    return null
  }

  const onChange = (checkedValues) => {
    if (checkedValues.length === 0) {
      props.setIntent(null)
    } else {
      let intent = []
      checkedValues.map(key => {
        let temp = {
          key: key,
          value: getValueFromKey(key),
        }

        return intent.push(temp)
      })

      props.setIntent(intent)
    }
  }

  const renderList = (list) => {
    // item - 0 - key - 1 - label - 2 - value
    return list ? list.map((item, index) => {
      return (
        <Col xs={48/list.length} xl={16/list.length} key={index} style={{textAlign: "center"}}>
          {/* I was thinking of assigning object to the checkbox value, but then there's no way for me to manipulate the way it compares 2 objects 
          so it can't be done. */}
          {
            progress.length === 0 ? "" : progress[index][1] === 0 ? (
              <Checkbox value={item[0]} disabled={!visible || disabled} style={{color: "#eb2f96"}}>
                {item[1]}
              </Checkbox>
            ) : (
              <Checkbox value={item[0]} disabled={!visible || disabled} style={{color: "#52c41a"}}>
                {item[1]}
              </Checkbox>
            )
          }
        </Col>
      )
    }) : ""
  }

  const radioStyle = {
    display: 'block',
    width: '100%',
    // height: '75px',
    // lineHeight: '75px',
  };

  const radioContextStyle = {
    display: 'inline-block',
    border: '1px solid black',
    borderRadius: "20px",
    height: '100%',
    width: "100%",
    paddingTop: "15px",
    paddingBottom: "15px",
    backgroundColor: "white",
    verticalAlign: 'middle',
  };

  const onRadioGroupChange = (e) => {
    if(e.target.value === 1) props.toggleTagVisibility(true);
    else props.toggleTagVisibility(false);
    setRadioValue(e.target.value);
  }


  if (loading) {
    return <LoadingComponent />
  }

  return (
    <>
      <Radio.Group onChange={onRadioGroupChange} value={radioValue} style={{width: '95%'}}>
        <Radio style={radioStyle} value={1} disabled={disabled}>
          <div style={radioContextStyle}>
            <Checkbox.Group onChange={onChange}>
              <Row>
                <Col xs={24} xl={4}><b style={{paddingLeft: "10px", color: disabled ? "grey" : "black"}}>Thông tin nghe được: </b></Col>
                {renderList(list)}
              </Row>
            </Checkbox.Group>
          </div>
        </Radio>
        {/* <Radio style={radioStyle} value={2}>
          <div style={radioContextStyle}>
            <div style={{textAlign: "center", width: `${100/list.length}%`}}>
              <p>Không có tag</p>  
            </div>
          </div>
        </Radio> */}
        <Radio style={{
          display: "block",
          height: "48px",
          lineHeight: "48px",
        }} value={2} disabled={disabled}><b style={{paddingLeft: "10px", color: disabled ? "grey" : "black"}}>Không có tag</b></Radio>
      </Radio.Group>




      {/* <Collapse defaultActiveKey={['commandConfirm']}>
        <Panel header="Xác nhận câu lệnh: " key="commandConfirm">
          <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
            <Row>
              {renderList(list)}
            </Row>
          </Checkbox.Group>
        </Panel>
      </Collapse> */}
    </>
  )
}
