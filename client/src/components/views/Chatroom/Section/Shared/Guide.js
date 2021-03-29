import React from 'react'

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
    </>
  )
}
