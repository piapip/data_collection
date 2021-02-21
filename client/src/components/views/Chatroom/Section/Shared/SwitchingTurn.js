import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';

export default function SwitchingTurn(props) {

  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const turn = props ? props.turn : -1;
  const userRole = props ? props.userRole : "";

  useEffect(() => {
    if ((turn === 2 && userRole === "servant") || (turn === 1 && userRole === "client")) {
      setIsModalVisible(true);
    }
  }, [turn, userRole])

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal 
      closable={false}
      visible={isModalVisible} 
      onOk={handleOk} 
      onCancel={handleCancel}>
      <p>Tới lượt của bạn</p>
    </Modal>
  )
}
