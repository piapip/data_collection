import React, { useState } from 'react';
import { useDispatch } from "react-redux";

import { Popconfirm } from 'antd';
import { removeLatestAudio } from '../../../../../_actions/chatroom_actions';

export default function RejectAudioButton(props) {

  const [ buttonState, setButtonState ] = useState(false);
  const [ buttonPhase, setButtonPhase ] = useState(0);

  const userRole = props ? props.userRole : "";
  const roomID = props ? props.roomID : "";
  const socket = props ? props.socket : null;
  const disabled = props ? props.disabled : true;
  const dispatch = useDispatch();

  const onReject = async () => {
    await setButtonState(true);
    await setButtonPhase(1);
    dispatch(removeLatestAudio(roomID, userRole))
    .then(async (response) => {
      setButtonPhase(0);
      setButtonState(false);
      if (response.payload.success === 1) {
        if (socket) {
          socket.emit('remove audio', {
            roomID,
          });
        }
      } else {
        alert(`${response.payload.message}. Code: ${response.payload.success}`);
      } 
    })
    // tao API cho Chatroom de xoa audio trong audioList. Chac se can them thong tin vao log. *chua biet them gi
    // API se return ve 
    //  -3 - server side
    //  -2 - khong tim thay audio de xoa. (biet dau bat ngo)
    //  -1 - khong co audio nao de xoa.
    //   0 - chua toi luot xoa.
    //   1 - xoa thanh cong.
  }

  const insertButton = (
    disabled ? (
      <button className="reject-buttons" disabled>Không hiểu audio</button>
    ) : (
      buttonState ? (
        <button className="reject-buttons" style={{cursor: 'not-allowed'}} disabled>{
          buttonPhase === 0 ? "Không hiểu audio" :
          buttonPhase === 1 ? "Đang xóa audio..." : "????HOWWWW???"
        }</button>
      ) : (
        <Popconfirm 
          title="Bạn sẽ xóa audio mà bên kia vừa gửi tới cho bạn, bạn chắc chắn là sẽ xóa không?"
          onConfirm={onReject}
          okText="Xóa"
          okButtonProps={{
            disabled: buttonState
          }}
          cancelText="Không xóa">
          <button className="reject-buttons">{
            buttonPhase === 0 ? "Không hiểu audio" :
            buttonPhase === 1 ? "Đang xóa audio..." : "????HOWWWW???"
          }</button>
        </Popconfirm>
      )
    )
  )

  return (
    <>
      {insertButton}
    </>
  )
}
