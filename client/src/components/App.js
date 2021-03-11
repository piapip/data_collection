import React, { Suspense, useState, useEffect } from 'react';
import { Route, Switch } from "react-router-dom";
import io from 'socket.io-client';
import Auth from "../hoc/auth";
// pages for this product
import Chatroom from "./views/Chatroom/Chatroom.js";
import LandingPage from "./views/LandingPage/LandingPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";
import NavBar from "./views/NavBar/NavBar";

import { BACKEND_URL } from './Config';

// Second parameter for route:
//null   Anyone Can go inside
//true   only logged in user can go inside
//false  logged in user can't go inside

let socket

function App(props) {

  const [ idle, setIdle ] = useState(0);
  const [ inQueue, setInQueue ] = useState(0);
  const [ inRoom, setInRoom ] = useState(0);

  const setupSocket =  async () => {
    var w_auth
    document.cookie.split(";").map(info => {
      if (info.slice(0,8) === " w_auth=") {
        return w_auth = info.substring(8)
      }else{
        return null;
      }
    })

    socket = io(BACKEND_URL, {
      query: {
        token: w_auth,
      },
      transports:['websocket','polling','flashsocket']
    });

    socket.on('disconnect', () => {
      socket = null
      console.log("Socket Disconnected!")

      // socket leaveroom
    });

    socket.on("connection", () => {
      console.log("Socket Connected!")
    });

    socket.on('refresh status', ({idle, inQueue, inRoom}) => {
      // console.log(`idle:`, idle);
      // console.log(`inRoom:`, inRoom);
      setIdle(idle);
      setInQueue(inQueue);
      setInRoom(inRoom);
    })
  }

  useEffect(() => {
    setupSocket()
  }, [])

  const LandingPageWithSocket = () => (<LandingPage socket={socket} />)
  const LoginPageWithSocket = () => (<LoginPage setupSocket={setupSocket} />)
  const ChatroomWithSocket = () => (<Chatroom socket={socket} />)

  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      <NavBar
        idle={idle}
        inQueue={inQueue}
        inRoom={inRoom}/>
      <div style={{ paddingTop: '69px', minHeight: 'calc(100vh - 80px)' }}>
      {/* <div style={{ paddingTop: '69px' }}> */}
        <Switch>
          <Route exact path="/" component={Auth(LandingPageWithSocket, null)} />
          <Route exact path="/login" component={Auth(LoginPageWithSocket, false)} />
          <Route exact path="/register" component={Auth(RegisterPage, false)} />
          {/* content-type: 0 - audio, 1 - text message */}
          <Route exact path="/chatroom/:content_type/:id" component={Auth(ChatroomWithSocket, true)} />

        </Switch>
      </div>
      {/* <Footer /> */}
    </Suspense>
  );
}

export default App;
