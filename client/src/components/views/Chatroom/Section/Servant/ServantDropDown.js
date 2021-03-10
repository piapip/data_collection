import React, { useState } from 'react'
// import { Collapse, Select, InputNumber, Row, Col, Radio } from 'antd';
import { Select, InputNumber, Row, Col, Radio } from 'antd';

import { COLOR } from '../../../../Config';

// const {Panel} = Collapse;
const {Option} = Select;

const deviceData = ['Không có', 'Bình nóng lạnh', 'Bếp', 'Cổng', 'Đèn cầu thang', 'Đèn bàn', 'Đèn trần', 'Điều hòa', 'Loa', 'Lò nướng', 'Lò sưởi', 'Quạt', 'Quạt thông gió', 'Tivi'];
const roomData = {
  'Quạt': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng vệ sinh', 'Phòng làm việc', 'Phòng tắm'],
  'Quạt thông gió': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng vệ sinh', 'Phòng làm việc', 'Phòng tắm'],
  'Tivi': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng ngủ', 'Phòng làm việc'],
  'Loa': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng ngủ', 'Phòng làm việc'],
  'Đèn bàn': ['Không có', 'Phòng khách', 'Phòng ngủ', 'Phòng làm việc'],
  'Đèn trần': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng vệ sinh', 'Phòng làm việc', 'Phòng tắm'],
  'Đèn cầu thang': ['Không có', 'Cầu thang'],
  'Bình nóng lạnh': ['Không có', 'Phòng khách', 'Phòng bếp', 'Phòng vệ sinh', 'Phòng tắm'],
  'Điều hòa': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng làm việc'],
  'Lò sưởi': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng làm việc'],
  'Cổng': ['Không có', 'Vườn', 'Garage'],
  'Lò nướng': ['Không có', 'Phòng bếp'],
  'Bếp': ['Không có', 'Phòng bếp'],
  'Không có': ['Không có', 'Phòng khách', 'Phòng ăn', 'Phòng bếp', 'Phòng ngủ', 'Phòng vệ sinh', 'Phòng làm việc', 'Phòng tắm', 'Vườn', 'Garage', 'Cầu thang']
};
const floorData = ['Không có', 'Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4'];
const actionData = {
  'Quạt': ['Không có', 'Bật', 'Tắt', 'Tăng', 'Giảm', 'Đặt', 'Kiểm tra'],
  'Quạt thông gió': ['Không có', 'Bật', 'Tắt', 'Kiểm tra'],
  'Tivi': ['Không có', 'Bật', 'Tắt', 'Tăng', 'Giảm', 'Đặt', 'Kiểm tra'],
  'Loa': ['Không có', 'Bật', 'Tắt', 'Tăng', 'Giảm', 'Đặt', 'Kiểm tra'],
  'Đèn bàn': ['Không có', 'Bật', 'Tắt', 'Tăng', 'Giảm', 'Đặt', 'Kiểm tra'],
  'Đèn trần': ['Không có', 'Bật', 'Tắt', 'Đặt', 'Kiểm tra'],
  'Đèn cầu thang': ['Không có', 'Bật', 'Tắt', 'Kiểm tra'],
  'Bình nóng lạnh': ['Không có', 'Bật', 'Tắt', 'Kiểm tra'],
  'Điều hòa': ['Không có', 'Bật', 'Tắt', 'Tăng', 'Giảm', 'Đặt', 'Kiểm tra'],
  'Lò sưởi': ['Không có', 'Bật', 'Tắt', 'Kiểm tra'],
  'Cổng': ['Không có', 'Mở', 'Đóng', 'Kiểm tra'],
  'Lò nướng': ['Không có', 'Bật', 'Tắt', 'Tăng', 'Giảm', 'Đặt', 'Kiểm tra'],
  'Bếp': ['Không có', 'Bật', 'Tắt', 'Tăng', 'Giảm', 'Đặt', 'Kiểm tra'],
  'Không có': ['Không có', 'Bật', 'Tắt', 'Tăng', 'Giảm', 'Đặt', 'Kiểm tra'],
};
const scaleData = {
  'Quạt': ['Không có', 'Mức'],
  'Quạt thông gió': ['Không có'],
  'Tivi': ['Không có', 'Kênh', 'Âm lượng'],
  'Loa': ['Không có', 'Âm lượng'],
  'Đèn bàn': ['Không có', 'Độ sáng'],
  'Đèn trần': ['Không có', 'Màu'],
  'Đèn cầu thang': ['Không có'],
  'Bình nóng lạnh': ['Không có'],
  'Điều hòa': ['Không có', 'Nhiệt độ', 'Thời gian hẹn giờ'],
  'Lò sưởi': ['Không có'],
  'Cổng': ['Không có'],
  'Lò nướng': ['Không có', 'Nhiệt độ', 'Thời gian hẹn giờ'],
  'Bếp': ['Không có', 'Nhiệt độ', 'Thời gian hẹn giờ'],
  'Không có': ['Không có', 'Mức', 'Kênh', 'Âm lượng', 'Độ sáng', 'Màu', 'Nhiệt độ', 'Thời gian hẹn giờ']
};

export default function ServantDropDown(props) {

  const intent = props ? props.intent : null;
  const turn = props ? props.turn : -1;
  const tagVisible = props ? props.visible : true;
  const disabled = props ? props.disabled : false;

  const [ radioValue, setRadioValue ] = useState(1);

  const [ roomList, setRoomList ] = useState(roomData[deviceData[0]]);
  const [ selectedRoom, setSelectedRoom ] = useState(roomData[deviceData[0]][0]);
  
  const [ selectedFloor, setSelectedFloor ] = useState(floorData[0]);

  const [ actionList, setActionList ] = useState(actionData[deviceData[0]]);
  const [ selectedAction, setSelectedAction ] = useState(actionData[deviceData[0]][0]);

  const [ scaleList, setScaleList ] = useState(scaleData[deviceData[0]]);
  const [ selectedScale, setSelectedScale ] = useState(scaleData[deviceData[0]][0]);

  const [ level, setLevel ] = useState('')

  const handleDeviceChange = (value) => {
    // console.log(value)
    setRoomList(roomData[value]);
    setSelectedRoom(roomData[value][0]);

    setActionList(actionData[value]);
    setSelectedAction(actionData[value][0]);

    setScaleList(scaleData[value]);
    setSelectedScale(scaleData[value][0]);

    setSelectedFloor(floorData[0]);

    // console.log(`selectedScale === "Màu" ? ${selectedScale} ${selectedScale === "Màu"}`)
    if(value === "Đèn trần") {
      setLevel(COLOR[0]);
      props.setIntent({...intent, level: COLOR[0]});
    } else {
      setLevel('');
      props.setIntent({...intent, level: ''});
    }

    // props.setIntent({...intent, device: value});
    props.setIntent({...intent, 
      device: (value  === "Không có" ? null : value),
      room: (roomData[value][0] === "Không có" ? null : roomData[value][0]),
      action: (actionData[value][0] === "Không có" ? null : actionData[value][0]),
      scale: (scaleData[value][0] === "Không có" ? null : scaleData[value][0]),
      floor: (floorData[0] === "Không có" ? null : floorData[0]),
      level: null,
    });
  }

  const onSelectedRoomChange = (value) => {
    // console.log(value);
    setSelectedRoom(value);

    props.setIntent({...intent, room: (value  === "Không có" ? null : value)});
  }

  const onSelectedFloorChange = (value) => {
    var floor = value === "Không có" ? null : value.match(/\d/g)[0];
    // console.log(value);
    setSelectedFloor(value);

    props.setIntent({...intent, floor: floor});
  }

  const onSelectedActionChange = (value) => {
    // console.log(value);
    setSelectedAction(value);

    props.setIntent({...intent, action: (value  === "Không có" ? null : value)});
  }

  const onSelectedScaleChange = (value) => {
    // console.log(value);
    setSelectedScale(value);
    if(value === "Màu" || value === "Không có") {
      setLevel(COLOR[0]);
      props.setIntent({...intent, 
        scale: (value  === "Không có" ? null : value),
        level: null,
      });
    } else {
      props.setIntent({...intent, 
        scale: (value  === "Không có" ? null : value),
      });
    }
  }

  const onSelectedLevelChange = (value) => {
    // console.log(value);
    setLevel(value);

    props.setIntent({...intent, level: ((value  === "Không có" || value === '') ? null : value)});
  }

  const radioStyle = {
    // display: 'block',
    width: '100%',
    marginTop: '0',
  };

  const radioContextStyle = {
    display: 'inline-block',
    // border: '1px solid #dedede',
    height: '100%',
    width: "100%",
    // borderRadius: "20px",
    // backgroundColor: "white",
    paddingLeft: "10px",
    paddingRight: "10px",
    verticalAlign: 'middle',
  };

  const onRadioGroupChange = (e) => {
    if(e.target.value === 1) props.toggleTagVisibility(true);
    else props.toggleTagVisibility(false);
    setRadioValue(e.target.value);
  }

  return (
    <Radio.Group onChange={onRadioGroupChange} value={radioValue} 
      style={{width: '95%', marginTop: '0px', verticalAlign: 'middle'}} disabled={disabled}>
      <div style={{marginTop: '0px', verticalAlign: 'middle'}}>
        
      <Radio style={radioStyle} value={1}>
        <div style={radioContextStyle}>
          <Row>
            <Col xl={4} xs={24} style={{paddingLeft: "5px", paddingRight: "5px"}}>
              <Row>
                <Col span={24} style={{paddingTop: "15px", paddingBottom: "5px"}}>
                  <b>Thiết bị</b>
                </Col>
                {/* <Col span={24} style={{paddingBottom: "15px"}}>*/}
                <Col span={24} style={{paddingBottom: "5px"}}>
                  <Select 
                    defaultValue={deviceData[0]} 
                    style={{ width: "100%" }}
                    onChange={handleDeviceChange}
                    disabled={turn !== 2 || !tagVisible}>
                    {
                      deviceData.map(device => (
                        <Option key={device}><p style={{width: "100%", whiteSpace: "normal"}}>{device}</p></Option>
                      ))
                    }
                  </Select>
                </Col>
              </Row>
            </Col>

            <Col xl={4} xs={24} style={{paddingLeft: "5px", paddingRight: "5px"}}>
              <Row>
                <Col span={24} style={{paddingTop: "15px", paddingBottom: "5px"}}>
                  <b>Hành động</b>
                </Col>
                <Col span={24} style={{paddingBottom: "5px"}}>
                  <Select
                    value={selectedAction}
                    style={{ width: "100%" }}
                    onChange={onSelectedActionChange}
                    disabled={turn !== 2  || !tagVisible}>
                    {
                      actionList.map(action => (
                        <Option key={action}><p style={{width: "100%", whiteSpace: "normal"}}>{action}</p></Option>
                      ))
                    }
                  </Select>
                </Col>
              </Row>
            </Col>

            <Col xl={4} xs={24} style={{paddingLeft: "5px", paddingRight: "5px"}}>
              <Row>
                <Col span={24} style={{paddingTop: "15px", paddingBottom: "5px"}}>
                  <b>Phòng</b>
                </Col>
                <Col span={24} style={{paddingBottom: "5px"}}>
                  <Select 
                    value={selectedRoom}
                    style={{ width: "100%" }}
                    onChange={onSelectedRoomChange}
                    disabled={turn !== 2  || !tagVisible}>
                    {
                      roomList.map(room => (
                        <Option key={room}><p style={{width: "100%", whiteSpace: "normal"}}>{room}</p></Option>
                      ))
                    }
                  </Select>
                </Col>
              </Row>
            </Col>

            <Col xl={4} xs={24} style={{paddingLeft: "5px", paddingRight: "5px"}}>
              <Row>
                <Col span={24} style={{paddingTop: "15px", paddingBottom: "5px"}}>
                  <b>Tầng</b>
                </Col>
                <Col span={24} style={{paddingBottom: "5px"}}>
                  <Select
                    value={selectedFloor}
                    style={{ width: "100%" }}
                    onChange={onSelectedFloorChange}
                    disabled={turn !== 2  || !tagVisible}>
                    {
                      floorData.map(floor => (
                        <Option key={floor}><p style={{width: "100%", whiteSpace: "normal"}}>{floor}</p></Option>
                      ))
                    }
                  </Select>
                </Col>
              </Row>
            </Col>

            <Col xl={4} xs={24} style={{paddingLeft: "5px", paddingRight: "5px"}}>
              <Row>
                <Col span={24} style={{paddingTop: "15px", paddingBottom: "5px"}}>
                  <b>Scale</b>
                </Col>
                <Col span={24} style={{paddingBottom: "5px"}}>
                  <Select
                    value={selectedScale}
                    style={{ width: "100%" }}
                    onChange={onSelectedScaleChange}
                    disabled={turn !== 2 || !tagVisible}>
                    {
                      scaleList.map(scale => (
                        <Option key={scale}><p style={{width: "100%", whiteSpace: "normal"}}>{scale}</p></Option>
                      ))
                    }
                  </Select>
                </Col>
              </Row>
            </Col>

            <Col xl={4} xs={24} style={{paddingLeft: "5px", paddingRight: "5px"}}>
              <Row>
                <Col span={24} style={{paddingTop: "15px", paddingBottom: "5px"}}>
                  <b>Level</b>
                </Col>
                <Col span={24} style={{paddingBottom: "5px"}}>
                  {
                    selectedScale === "Màu" ? (
                      <Select
                        value={level}
                        placeholder="Chọn màu"
                        style={{ width: "100%" }}
                        onChange={onSelectedLevelChange}
                        disabled={turn !== 2 || !tagVisible}>
                        {
                          COLOR.map(color => (
                            <Option key={color}><p style={{width: "100%", whiteSpace: "normal"}}>{color}</p></Option>
                          ))
                        }
                      </Select>
                    ) : selectedScale !== "Không có" ? (
                      <InputNumber 
                        value={level}
                        min={0}
                        max={500}
                        style={{ width: "100%" }}
                        placeholder="Nhập số"
                        onChange={onSelectedLevelChange}
                        disabled={turn !== 2 || !tagVisible}
                      />
                    ) : (
                      <InputNumber 
                        value={level}
                        min={0}
                        max={500}
                        style={{ width: "100%" }}
                        placeholder="Nhập số"
                        disabled={true} />
                    )
                  }
                </Col>
              </Row>
            </Col>
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
