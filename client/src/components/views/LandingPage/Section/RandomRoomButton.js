import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useDispatch } from "react-redux";

import { Button, Modal, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { getRandomRoom } from '../../../../_actions/chatroom_actions';
import ErrorInternalSystem from '../../Error/ErrorInternalSystem';

const useStyles = makeStyles((theme) => ({
  paper: {
    top: "20%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    // border: '1px solid #dedede',
    padding: theme.spacing(2, 4, 3),
  },
}));


export default function RandomRoomButton(props) {

  const isAuth = props ? props.isAuth : false;
  const userID = props ? props.userID : "";

  const [ randomRoomID, setRandomRoomID ] = useState("");
  const [ redirect, setRedirect ] = useState(false);
  const [ roomType, setRoomType ] = useState("");
  const [ alert, setAlert ] = useState(0);
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const dispatch = useDispatch();
  const classes = useStyles();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onClickRandom = () => {
    dispatch(getRandomRoom(userID))
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
  
  if (alert  === 1) {
    return (
      <><ErrorInternalSystem /></>
    )
  } else {
    return (
      <>
        <Modal
          open={isModalVisible}
          onClose={handleCancel}>
            <div className={classes.paper}>
              <h2>Hết phòng!</h2>
              <Divider />
              <p>Hiện tại đang không còn phòng nào trống! Mong bạn hãy vào hàng chờ bằng ấn nút <b>Sẵn sàng</b> và chờ một người khác để tạo phòng cùng. Xin cảm ơn.</p>
              <Divider style={{ marginTop: "10px", marginBottom: "10px" }}/>
              <div style={{float: "right"}}>
                <Button variant="contained" color="secondary" onClick={handleCancel}>Đóng</Button>
                <Button variant="contained" style={{marginLeft: "10px", backgroundColor: "#90caf9", color: "#585D5E"}} onClick={handleCancel}>Đã hiểu</Button>
              </div>
            </div>
        </Modal>
        {
          isAuth ? (
            <Button style={{border: "1px solid #dedede"}} onClick={onClickRandom}>Chọn phòng ngẫu nhiên</Button>
          ) : (
            <Link to={`/login`}>
              <Button>Chọn phòng ngẫu nhiên</Button>
            </Link>
          )
        }
        
      </>
    )
  }
  
}
