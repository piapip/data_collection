import React from 'react'

// import { Steps } from 'antd';

// const { Step } = Steps;

export default function Guide(props) {

  // const turn = props ? props.turn-1 : 0;
  const cheatSheet = props ? props.cheatSheet : [];

  return (
    <>
      {
        cheatSheet.map((item, index) => (
          <p key={`cheat_sheet_${index}`}>{item}</p>
        ))
      }
      {/* <Steps current={turn}>
        <Step title="Client" description="Thu âm và gán tag cho audio." />
        <Step title="Servant" description="Kiểm tra tag của audio." />
        <Step title="Servant" description="Thu âm và gửi audio." />
      </Steps> */}
    </>
  )
}
