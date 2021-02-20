import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from "react-redux";

import { Modal, Button } from 'antd';

import { getRandomRoom } from '../../../../_actions/chatroom_actions'
import ErrorInternalSystem from '../../Error/ErrorInternalSystem'
// import ErrorNotFound from '../../Error/ErrorNotFound'

export default function RandomRoomButton() {

  const [ randomRoomID, setRandomRoomID ] = useState("");
  const [ redirect, setRedirect ] = useState(false);
  const [ roomType, setRoomType ] = useState("");
  const [ alert, setAlert ] = useState(0);
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const dispatch = useDispatch();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onClickRandom = () => {
    dispatch(getRandomRoom())
    .then(async (response) => {
      if (response.payload.success) {
        if (response.payload.roomFound === null) { 
          // setAlert(2)
          showModal()
        } else {
          setAlert(0)
          setRandomRoomID(response.payload.roomFound._id);
          setRoomType(response.payload.roomFound.content_type);
          setRedirect(true);
        }
        
      } else {
        setAlert(1)
        window.alert("Something's wrong with the server. We are very sorry for the inconvenience!")
        return class extends React.Component {
          render() {
            return (
              <ErrorInternalSystem />
            )
          }
        }
      }
    })
    .catch(err => console.log(err))
  }

  if (redirect) {
    return (
      <Redirect to={`/chatroom/${roomType}/${randomRoomID}`} />
    )
  }
  
  // if (alert === 2) {
  //   return (
  //     <><ErrorNotFound target="room"/></>
  //   )
  // } else 
  if (alert  === 1) {
    return (
      <><ErrorInternalSystem /></>
    )
  } else {
    return (
      <>
      <Modal 
        title="Hết phòng!" 
        visible={isModalVisible}
        closable={false}
        onOk={handleOk} 
        onCancel={handleCancel}>
        <p>Hiện tại đang không còn phòng nào trống! Mong bạn hãy vào hàng chờ bằng ấn nút "Sẵn sàng" và chờ một người khác để tạo phòng cùng. Xin cảm ơn.</p>
      </Modal>
      {/* flood gate this button so it can only be clicked once. This button mechanic will be changed later. */}
        {/* <Link to={`/chatroom/${roomType}/${randomRoomID}`}><Button>Chọn phòng ngẫu nhiên</Button></Link> */}
        <Button onClick={onClickRandom}>Chọn phòng ngẫu nhiên</Button>
      </>
    )
  }
  
}
