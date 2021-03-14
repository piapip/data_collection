import React, { useState } from 'react';
import  { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAllRooms } from '../../../../_actions/chatroom_actions';

import { Table, Row, Col, Button, Popover } from 'antd';
import { CheckCircleTwoTone, MinusCircleTwoTone , MinusOutlined } from '@ant-design/icons';

import RandomRoomButton from './RandomRoomButton';
import LoadingComponent from './../../Loading/LoadingComponent';
import ErrorInternalSystem from '../../Error/ErrorInternalSystem';

const { Column } = Table;

function RoomList(props) {

  const [ loading, setLoading ] = useState(true);
  const [ roomList, setRoomList ] = useState([]);
  const isAuth = props ? props.isAuth : false;
  const pageSize = props ? props.pageSize : 4;
  const userID = props ? props.userID : "";
  const readyStatus = props ? props.readyStatus : true;
  const dispatch = useDispatch();

  // !!! POTENTIAL BUG!!! 
  // IF THE ROOM COUNT IS TOO BIG, IT MAY NOT LOAD EVERYTHING.
  // as they say, there's some problem with setState that I need to clean up so I'll just drop a bomb here as a mark
  // vvvvv Flood gate to make sure dispatch is fired only once.
  if (roomList.length === 0) {
    dispatch(getAllRooms())
    .then(response => {
      if (response.payload.success) {
        response.payload.roomFound.map(room => {
          room.capacity = 0
          if (room.user1 !== null) room.capacity++
          if (room.user2 !== null) room.capacity++
          if (!room.done && 
            (
              (room.client.includes(userID) && (room.user1 === userID || room.user1 === null)) || 
              (room.servant.includes(userID) && (room.user2 === userID || room.user2 === null))
            )
          ) {
            room.superPrior = 1;
          } else room.superPrior = 0;
          return room.key = room._id;
        })

        response.payload.roomFound.sort((a, b) => {
          if (a.superPrior < b.superPrior) return 11;
          else if (a.superPrior > b.superPrior) return -1;
          else {
            if (a.done && !b.done) return 1;
            else if (!a.done && b.done) return -1;
            else {
              if (a.name < b.name) return -1;
              else if (a.name > b.name) return 1;
              else return 0;
            }
          }
        })

        setRoomList(response.payload.roomFound.filter(room => room.done === false))
      } else {
        alert("Something's wrong with the server. We are very sorry for the inconvenience!")
      }
      setLoading(false);
    })
  }

  const content = (
    <div>
      Bạn phải "Dừng tìm kiếm" nếu bạn muốn dùng chức năng này.
    </div>
  )

  let lastIndex = 0
  const updateIndex = () => {
    let index = roomList[lastIndex] ? `${roomList[lastIndex].content_type}/${roomList[lastIndex]._id}` : "";
    lastIndex++;
    return index
  }

  if (loading) {
    return (
      <div style={{ height: "100px" }}>
        <Col style={{textAlign: "center"}}>
          <LoadingComponent />
        </Col>
      </div>
      
    )
  } else if (roomList === null) {
    return (
      <>
        <ErrorInternalSystem />
      </>
    )
  } else {
    return (
      <>
        {
          roomList.length > 0 ? 
            !readyStatus ? (
            <Row style={{marginBottom: "10px"}}>
              <Col style={{textAlign: "center"}}>
                <RandomRoomButton 
                  isAuth={isAuth}
                  userID={userID}/>
              </Col>
            </Row>
          ) : (
            <Row style={{marginBottom: "10px"}}>
              <Col style={{textAlign: "center"}}>
                <Popover trigger="hover" content={content}>
                  <Button disabled>Chọn phòng ngẫu nhiên</Button>
                </Popover>
              </Col>
            </Row>
          ) : ""
        }

        <Row>
          <Col>
            <Table
              dataSource={roomList} 
              pagination={{ pageSize: parseInt(pageSize) }}
              onRow={(record) => {
                return {
                  style: { 
                    background: record.superPrior === 1 ? "#F3F0AD" : "white",
                    fontWeight: record.superPrior === 1 ? "bold" : "norma",
                  }
                }
              }} >
              <Column dataIndex='name' key='name' />
              {/* <Column 
                title='Tiến độ' 
                dataIndex='progress' 
                key='progress' 
                render={(progress) => (
                <>
                  {Object.entries(progress).map((object) => {
                    if (object[0] !== "_id" && object[0] !== "__v") {
                      return object[1] !== -1 ? (
                        object[1] === 0 ? (
                          <MinusCircleTwoTone key={object[0]} twoToneColor="#eb2f96"/>
                        ) : (
                          <CheckCircleTwoTone key={object[0]} twoToneColor="#52c41a"/>
                        )
                      ) : (
                        <MinusOutlined key={object[0]} />
                      )
                    } else return ""
                  })}
                </>
              )}/> */}
              <Column 
                title='Người tham gia' 
                dataIndex='capacity' 
                align='center' 
                key='capacity' 
                render={(capacity) => (
                <>
                  {capacity}/2
                </>
              )}/>

              <Column render={() => {
                return (
                  <>
                    {/* !!! A BUG !!! CHAT ROOM INDEX DOESN'T REFRESH AFTER {LOG OUT THEN RE LOGIN}*/}
                    {
                      readyStatus ? (
                        <Popover trigger="hover" content={content}>
                          <p style={{color: "#1890ff", fontSize: "14px"}}>Join</p>
                          {/* <Link to={`/chatroom/${updateIndex()}`} style={{pointerEvents: "none"}}>
                            Join
                          </Link> */}
                        </Popover>
                      ) : (
                        isAuth ? (
                          <Link to={`/chatroom/${updateIndex()}`}>
                            Join
                          </Link>
                        ) : (
                          <Link to={`/login`}>
                            Join
                          </Link>
                        )
                        
                      )
                    }
                    {/* <Link to={`/chatroom/${updateIndex()}`}>
                      Join
                    </Link> */}
                  </>
                )
              }} />
            </Table>
            </Col>
        </Row>
      </>
    )
  }

}

export default RoomList