import React, { useState } from 'react'
import { Form, Select, Input, Row, Col, Radio } from 'antd';

import intentInfo from './intent';
import "./Dropdown.css";

const {Option} = Select;

const intentData = intentInfo.INTENT;
const genericIntentData = intentInfo.GENERIC_INTENT;

export default function Dropdown(props) {

  const tagVisible = props ? props.visible : true;
  const disabled = props ? props.disabled : false;

  const [ radioValue, setRadioValue ] = useState(1);

  const [ selectedIntent, setSelectedIntent ] = useState(null);

  const [ selectedDistrict, setSelectedDistrict ] = useState(null);
  const [ districtList, setDisctrictList ] = useState([]);
  const [ validator, setValidator ] = useState({
    name: " ",
    cmnd: " ",
    four_last_digits: " ",
  });

  const handleIntentChange = (value) => {
    const intentIndex = intentData.findIndex(item => {
      return item.name === value
    });
    setSelectedIntent(intentIndex);
    props.setIntent(intentIndex);
  }

  const handleGenericIntentChange = (value) => {
    const genericIntentIndex = genericIntentData.findIndex(item => {
      return item === value
    });
    props.setGenericIntent(genericIntentIndex);
  }

  const onSlotSelectChange = (key) => {
    // const keyParsing = key.split(' ', 2);
    const keyParsing = key.split(/(?<=^\S+)\s/)
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

    if (slot === "cmnd") {
      const re = '^[0-9]+$';
      if (!(new RegExp(re).test(slotValue))) {
        let newValidator = validator;
        newValidator[slot] = "CMND chỉ nhận số!";
        setValidator(newValidator);
      } else {
        let newValidator = validator;
        newValidator[slot] = " ";
        setValidator(newValidator);
      }
    }

    if (slot === "four_last_digits") {
      const re = '^[0-9]+$';
      if (slotValue.length !== 4 || !(new RegExp(re).test(slotValue))) {
        let newValidator = validator;
        newValidator[slot] = "Phải nhập 4 số!";
        setValidator(newValidator);
      } else {
        let newValidator = validator;
        newValidator[slot] = " ";
        setValidator(newValidator);
      }
    }
    props.setSlot(slot, slotValue);
  }

  const handleCityChange = (value) => {
    
    setDisctrictList(intentInfo.DISTRICT[value]);
    setSelectedDistrict(null);
    const cityIndex = intentInfo.CITY.findIndex(item => {
      return item === value;
    })

    props.setSlot("city", cityIndex);
  }

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    const districtIndex = districtList.findIndex(item => {
      return item === value;
    })

    props.setSlot("district", districtIndex);
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
    verticalAlign: 'top',
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
    // paddingTop: "15px", 
    paddingBottom: "5px",
  }

  const titleStyle = {
    paddingTop: "1px",
    lineHeight: "200%",
    textAlign: "left",
  }

  const innerCol2Style = {
    // paddingBottom: "15px",
    paddingBottom: "5px",
  }

  const getLabel = (slot) => {
    const slotIndex = intentInfo.SLOT_LABEL.findIndex(item => {
      return item.tag.toUpperCase() === slot.toUpperCase();
    })

    return slotIndex === -1 ? "" : intentInfo.SLOT_LABEL[slotIndex].name
  }

  const renderMainIntent = (
    <Row justify={'center'}>
      <Col span={24} style={innerCol1Style}>
        <b>Ý định nghiệp vụ:</b>
      </Col>
      <Col span={4} style={titleStyle}>
        <b>Ý định: </b>
      </Col>
      <Col span={20} style={innerCol2Style}>
        <Select
          // defaultValue={null}
          // style={{ width: "50%" }}
          style={{ width: "100%" }}
          onChange={handleIntentChange}
          disabled={disabled || !tagVisible}>
          {
            intentData.map(intent => (
              <Option key={intent.name}><p style={{width: "100%", whiteSpace: "normal"}}>{intent.name}</p></Option>
            ))
          }
        </Select>
      </Col>
    </Row>
  )

  const emptyOption = (
    [1, 2, 3].map((value) => {
      return (
        <Col xl={8} xs={24} style={outerColStyle} key={`empty_${value}`}>
          <Row>
            <Col span={24} style={innerCol1Style}>
              <b>???</b>
            </Col>
            <Col span={24} style={innerCol2Style}>
              <Select
                // placeholder="Phải chọn ý định trước!"
                style={{ width: "100%" }}
                disabled={true}>
              </Select>
            </Col>
          </Row>
        </Col>
      )
    })
  )

  return (
    <Radio.Group onChange={onRadioGroupChange} value={radioValue} 
      style={{width: '95%', marginTop: '0px', verticalAlign: 'middle'}} 
      disabled={disabled}>
      <div style={{marginTop: '0px', verticalAlign: 'middle'}}>
        
      <Radio value={1} style={radioStyle}>
      {/* <Radio value={1} style={{
        display: 'inline-block',
        width: '70%',
        marginTop: '0',
      }}> */}
        <div style={radioContextStyle}>
          {/* <Row style={{marginBottom: "5px"}}> */}
          <Row>
            <Col xl={24} xs={24} style={outerColStyle}>
              {renderMainIntent}
            </Col>

            {
              intentData[selectedIntent] ? intentData[selectedIntent].slot.map(slot => {
                const slotValuePool = intentInfo[slot.toUpperCase()];
                return (
                  <Col xl={8} xs={24} style={outerColStyle} key={slot}>
                    <Row>
                      <Col span={24} style={innerCol1Style}>
                        <b>{getLabel(slot)}</b>
                      </Col>
                      <Col span={24} style={innerCol2Style}>
                        {
                          (
                            slot === "city" ? (
                              <Col span={24} style={innerCol2Style}>
                                <Select
                                  defaultValue={null}
                                  style={{ width: "100%" }}
                                  onChange={handleCityChange}
                                  disabled={disabled || !tagVisible}>
                                  {
                                    intentInfo.CITY.map(city => (
                                      <Option key={city}><p style={{width: "100%", whiteSpace: "normal"}}>{city}</p></Option>
                                    ))
                                  }
                                </Select>
                              </Col>
                            ) : 
                            slot === "district" ? (
                              <Col span={24} style={innerCol2Style}>
                                <Select
                                  value={selectedDistrict}
                                  defaultValue={null}
                                  style={{ width: "100%" }}
                                  onChange={handleDistrictChange}
                                  disabled={disabled || !tagVisible}>
                                  {
                                    districtList.map(district => (
                                      <Option key={district}><p style={{width: "100%", whiteSpace: "normal"}}>{district}</p></Option>
                                    ))
                                  }
                                </Select>
                              </Col>
                            ) : slotValuePool ? (
                              <Select
                                defaultValue={null}
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
                              <Form>
                                <Form.Item
                                  // name={slot}
                                  style={{marginBottom: "0px"}}
                                  validateStatus={validator[slot] !== " " ? "error" : "validating"}
                                  help={validator[slot]}
                                >
                                  <Input
                                    style={{ width: "100%" }}
                                    name={slot}
                                    onChange={onSlotTypeChange}
                                    disabled={disabled || !tagVisible}
                                  />
                                </Form.Item>
                              </Form>
                            )
                          )
                        }
                      </Col>
                    </Row>
                  </Col>
                )
              }) : (
                emptyOption
              )
            }
          </Row>
        </div>
      </Radio>

      <Radio style={radioStyle} value={2}>
      {/* <Radio value={2} style={{
        width: '25%',
        marginTop: '0',
      }}> */}
        <div style={radioContextStyle}>
          <Row justify={'center'}>
            {/* <Col xl={6} xs={24} style={outerColStyle}>
              <Row> */}
                <Col span={24} style={innerCol1Style}>
                  <b>Ý định khác: </b>
                </Col>
                <Col span={4} style={titleStyle}>
                  <b>Ý định: </b>
                </Col>
                <Col span={20} style={innerCol2Style}>
                  <Select
                    defaultValue={null}
                    // style={{ width: "50%" }}
                    style={{ width: "100%" }}
                    onChange={handleGenericIntentChange}
                    disabled={disabled || tagVisible}>
                    {
                      genericIntentData.map(intent => (
                        <Option key={intent}><p style={{width: "100%", whiteSpace: "normal"}}>{intent}</p></Option>
                      ))
                    }
                  </Select>
                </Col>
              {/* </Row>
            </Col> */}
          </Row>
        </div>
      </Radio>
    </div>
  </Radio.Group>
  )
}
