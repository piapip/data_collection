import React, { useState } from 'react'
import { Select, Input, Row, Col, Radio } from 'antd';

import intentInfo from './../Shared/intent';

const {Option} = Select;

const intentData = intentInfo.INTENT;
// const roomData = {
//   'Quạt': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng vệ sinh', 'Phòng làm việc', 'Phòng tắm'],
//   'Quạt thông gió': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng vệ sinh', 'Phòng làm việc', 'Phòng tắm'],
//   'Tivi': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng ngủ', 'Phòng làm việc'],
//   'Loa': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng ngủ', 'Phòng làm việc'],
//   'Đèn bàn': ['Không có', 'Phòng khách', 'Phòng ngủ', 'Phòng làm việc'],
//   'Đèn trần': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng vệ sinh', 'Phòng làm việc', 'Phòng tắm'],
//   'Đèn cầu thang': ['Không có', 'Cầu thang'],
//   'Bình nóng lạnh': ['Không có', 'Phòng khách', 'Phòng bếp', 'Phòng vệ sinh', 'Phòng tắm'],
//   'Điều hòa': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng làm việc'],
//   'Lò sưởi': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng làm việc'],
//   'Cổng': ['Không có', 'Vườn', 'Garage'],
//   'Lò nướng': ['Không có', 'Phòng bếp'],
//   'Bếp': ['Không có', 'Phòng bếp'],
//   'Không có': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng vệ sinh', 'Phòng làm việc', 'Phòng tắm', 'Vườn', 'Garage', 'Cầu thang']
// };

export default function ServantDropDown(props) {

  // const intent = props ? props.intent : null;
  const tagVisible = props ? props.visible : true;
  const disabled = props ? props.disabled : false;

  const [ radioValue, setRadioValue ] = useState(1);

  const [ selectedIntent, setSelectedIntent ] = useState(null);

  const handleIntentChange = (value) => {
    const intentIndex = intentData.findIndex(item => {
      return item.name === value
    });
    setSelectedIntent(intentIndex);
    console.log(intentIndex);
    props.setIntent(intentIndex);
  }

  const onSlotSelectChange = (key) => {
    const keyParsing = key.split(' ');
    const slot = keyParsing[0];
    const tag = keyParsing[1];
    const tagIndex = intentInfo[slot.toUpperCase()].findIndex(item => {
      return item.tag === tag;
    });

    props.setSlot(slot, tagIndex);
  }

  const onSlotTypeChange = (e) => {
    const slot = e.target.name;
    const slotValue = e.target.value;

    props.setSlot(slot, slotValue);
  }

  const radioStyle = {
    width: '100%',
    marginTop: '0',
  };

  const radioContextStyle = {
    display: 'inline-block',
    height: '100%',
    width: "100%",
    paddingLeft: "10px",
    paddingRight: "10px",
    verticalAlign: 'middle',
  };

  const onRadioGroupChange = (e) => {
    if(e.target.value === 1) props.toggleTagVisibility(true);
    else props.toggleTagVisibility(false);
    setRadioValue(e.target.value);
  }

  const outerColStyle = {
    paddingLeft: "5px", 
    paddingRight: "5px",
  }

  const innerCol1Style = {
    paddingTop: "15px", 
    paddingBottom: "5px",
  }

  const innerCol2Style = {
    // paddingBottom: "15px",
    paddingBottom: "5px",
  }

  return (
    <Radio.Group onChange={onRadioGroupChange} value={radioValue} 
      style={{width: '95%', marginTop: '0px', verticalAlign: 'middle'}} disabled={disabled}>
      <div style={{marginTop: '0px', verticalAlign: 'middle'}}>
        
      <Radio style={radioStyle} value={1}>
        <div style={radioContextStyle}>
          <Row>
            <Col xl={6} xs={24} style={outerColStyle}>
              <Row>
                <Col span={24} style={innerCol1Style}>
                  <b>Ý định</b>
                </Col>
                <Col span={24} style={innerCol2Style}>
                  <Select
                    defaultValue={null}
                    style={{ width: "100%" }}
                    onChange={handleIntentChange}
                    // disabled={turn !== 2 || !tagVisible}>
                    disabled={disabled || !tagVisible}>
                    {
                      intentData.map(intent => (
                        <Option key={intent.name}><p style={{width: "100%", whiteSpace: "normal"}}>{intent.name}</p></Option>
                      ))
                    }
                  </Select>
                </Col>
              </Row>
            </Col>

            {
              intentData[selectedIntent] ? intentData[selectedIntent].slot.map(slot => {
                const slotValuePool = intentInfo[slot.toUpperCase()];
                return (
                  <Col xl={4} xs={24} style={outerColStyle} key={slot}>
                    <Row>
                      <Col span={24} style={innerCol1Style}>
                        <b>{slot}</b>
                      </Col>
                      <Col span={24} style={innerCol2Style}>
                        {
                          slotValuePool ? (
                            <Select
                              // value={selectedAction}
                              style={{ width: "100%" }}
                              onChange={onSlotSelectChange}
                              disabled={disabled || !tagVisible}>
                              {
                                slotValuePool.map(item => (
                                  <Option key={`${slot} ${item.tag}`}><p style={{width: "100%", whiteSpace: "normal"}}>{item.name}</p></Option>
                                ))
                              }
                            </Select>
                          ) : (
                            <Input 
                              style={{ width: "100%" }}
                              placeholder="Nhập thông tin"
                              name={slot}
                              onChange={onSlotTypeChange}
                              disabled={disabled || !tagVisible}
                            />
                          )
                        }
                      </Col>
                    </Row>
                  </Col>
                )
              }) 
              : ""
            }
          </Row>
        </div>
      </Radio>
      
      <Radio style={{
        display: "block",
        height: "48px",
        lineHeight: "48px",
      }} value={2}><b style={{paddingLeft: "10px", color: disabled ? "grey" : "black"}}>Không có tag</b>
      </Radio>
      
    </div>
  </Radio.Group>
  )
}
