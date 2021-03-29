import React from 'react';

import "./Status.css";

export default function Status(props) {

  const message = props ? props.message : "Loading...";
  const userRole = props ? props.userRole : "";

  const convertMessage = (line) => {
    // let newLine = line;
    if (userRole === "client") {
      // newLine = line.replace("Client", "Bạn");
      // newLine = newLine.replace("Servant", "Bạn bên kia");
      // newLine = newLine.replace("client", "bạn");
      // newLine = newLine.replace("servant", "bạn bên kia");
      // return line.replace("Client", "Bạn").replace("Servant", "Bạn bên kia").replace("client", "bạn").replace("servant", "bạn bên kia");
      return line.replace("Client", "Bạn").replace("client", "bạn");
    } else if (userRole === "servant") {
      // newLine = line.replace("Servant", "Bạn");
      // newLine = newLine.replace("Client", "Bạn bên kia");
      // newLine = newLine.replace("servant", "bạn");
      // newLine = newLine.replace("client", "bạn bên kia");
      // return line.replace("Servant", "Bạn").replace("Client", "Bạn bên kia").replace("servant", "bạn").replace("client", "bạn bên kia");
      return line.replace("Servant", "Bạn").replace("servant", "bạn");
    }
    // return newLine;
  }

  return (
    <>
      <div>
        <div style={{paddingRight: "20px", paddingLeft: "20px", zIndex: "1000"}}>
          <p className={`glow glow_${userRole}`}>{convertMessage(message)}</p>
          {/* <p className={`glow glow_${userRole}`}>{message}</p> */}
        </div>
      </div>
    </>
  )
}
