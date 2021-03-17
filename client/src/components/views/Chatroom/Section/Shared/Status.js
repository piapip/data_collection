import React from 'react';

import { Affix } from 'antd';
import "./Status.css";

export default function Status(props) {

  const message = props ? props.message : "Loading...";
  const userRole = props ? props.userRole : "";

  const convertMessage = (line) => {
    let newLine = line;
    if (userRole === "client") {
      newLine = line.replace("Client", "Bạn");
      newLine = newLine.replace("Servant", "Bạn bên kia");
      newLine = newLine.replace("client", "bạn");
      newLine = newLine.replace("servant", "bạn bên kia");
    } else if (userRole === "servant") {
      newLine = line.replace("Servant", "Bạn");
      newLine = newLine.replace("Client", "Bạn bên kia");
      newLine = newLine.replace("servant", "bạn");
      newLine = newLine.replace("client", "bạn bên kia");
    }
    return newLine;
  }

  return (
    <>
      <Affix offsetTop={69}>
        <div style={{paddingTop: "10px", paddingRight: "20px", paddingLeft: "20px", zIndex: "1000", textAlign: "center"}}>
          <p className={`glow glow_${userRole}`}>{convertMessage(message)}</p>
        </div>
      </Affix>
    </>
  )
}
