import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from "react-redux";
import { Redirect } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';

import RoomList from './Section/RoomList';
import ReadyButton from './Section/ReadyButton';
import ConfirmModal from './Section/ConfirmModal';
import LoadingPage from './../Loading/LoadingPage';
import './LandingPage.css';
import WarningTrack from './league_queue-pop.mp3';

function LandingPage(props) {
  const role = useRef("");
  const content_type = useRef("");

  // const [ inputType, setInputType ] = useState("audio")
  let inputType = "audio";
  const [ readyStatus, setReadyStatus ] = useState(false);
  // 0 - nothing, 1 - waiting for the other person to accept
  const [ promptStatus, setPromptStatus ] = useState(0);
  const [ promptDuration, setPromptDuration ] = useState(10);

  const [ matchFound, setMatchFound ] = useState(false);
  const [ redirect, setRedirect ] = useState(false); // redirect is the substitute of history.
  const [ roomLink, setRoomLink ] = useState('');
  const [ loading, setLoading ] = useState(true);
  const [ anchorEl, setAnchorEl ] = useState(null);
  const [ popoverOpenStatus, setPopoverOpenStatus ] = useState(true);

  const [ timer, setTimer ] = useState(0);
  const increment = useRef(null);

  const openPopover = (event) => {
    setAnchorEl(event.currentTarget);
    setPopoverOpenStatus(true);
  };

  const closePopover = () => {
    // setAnchorEl(null);
    setPopoverOpenStatus(false);
  };

  const user = useSelector(state=>state.user)
  let socket = props ? props.socket : null;

  useEffect(() => {
    if (socket !== null && user !== null) {
      setLoading(false);
    }
  }, [socket, user])

  const notificationAudio = new Audio(WarningTrack);
  useEffect(() => {
    if (socket) {
      socket.on('match', ({ client, servant, roomType }) => {
        let yourRole = ""
        if (user.userData && client.userID === user.userData._id) yourRole = "client"
        if (user.userData && servant.userID === user.userData._id) yourRole = "servant"
        console.log(`Found match! You are ${yourRole}. Your room type is ${roomType}`)
        role.current = yourRole;
        content_type.current = roomType;
        const promise = notificationAudio.play();
        if (promise !== undefined) {
          promise.then(_ => {
            // Autoplay started!
          }).catch(error => {
            // Autoplay was prevented.
            // Show a "Play" button so that user can start playback.
            console.log("Error play warning: ", error);
          });
        }
        setMatchFound(true);
        // setAnchorEl(null);
        setPopoverOpenStatus(false);
      });
    }
  }, [socket, notificationAudio, user.userData])

  useEffect(() => {
    if (socket) {
      socket.on('prompt successful', ({ roomID }) => {
        let link = `/chatroom/${content_type.current === "audio" ? 0 : 1}/${roomID}`
        setMatchFound(false);
        setReadyStatus(false);
        setRoomLink(link);
        setRedirect(true);
      });

      // when the other user miss or doesn't accept the second prompt, get back to queueing
      socket.on('requeue', () => {
        setMatchFound(false);
        setPromptStatus(0);
        setPromptDuration(10);
      });

      socket.on('too late', () => {
        setMatchFound(false);
        setReadyStatus(false);
        setPromptDuration(10);
        clearInterval(increment.current);
        setTimer(0);
      });
    }
  }, [socket, user.userData]);

  useEffect(() => {
    let isMount = true;
    if (!readyStatus) {
      clearInterval(increment.current);
      if (isMount) setTimer(0);
    }

    return () => { isMount = false }
  }, [ readyStatus ])

  const ready = () => {
    // readySignal
    if (socket) {
      setReadyStatus(true)
      let userID = user.userData ? user.userData._id : "";
      let username = user.userData ? user.userData.name : "";
      let socketID = socket.id;
      socket.emit("ready", {
        socketID,
        userID,
        username,
        inputType,
      })
    }
    // start counting
    increment.current = setInterval(() => {
      setTimer((timer) => timer + 1)
    }, 1000)
  }

  const cancelReady = () => {
    // cancelReadySignal
    if (socket) {
      setReadyStatus(false)
      let userID = user.userData ? user.userData._id : "";
      let username = user.userData ? user.userData.name : "";
      let socketID = socket.id;
      socket.emit("cancel ready", {
        socketID,
        userID,
        username,
        inputType,
      })
    }
    // stop counting
    clearInterval(increment.current);
    setTimer(0);
  }

  const timeConverter = (seconds) => {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60

    return [hours, minutes, seconds % 60].map(format).join(':')
  }

  // when the user confirm the second prompt, be ready for the conversation to start.
  const handleConfirmPromptModal = () => {
    // socket logic goes here
    let userID = user.userData ? user.userData._id : "";
    let username = user.userData ? user.userData.name : "";
    let socketID = socket.id
    socket.emit("confirm prompt", {
      socketID,
      userID,
      username,
      inputType,
      timer,
    })
  }

  // when the user denies the prompt or misses the prompt because time runs out.
  const handleDenyPromptModal = () => {
    setMatchFound(false)
    setReadyStatus(false)

    let userID = user.userData ? user.userData._id : "";
    let username = user.userData ? user.userData.name : "";
    let socketID = socket.id;
    // socket logic goes here
    socket.emit('cancel prompt', ({
      socketID,
      userID,
      username,
      inputType,
    }))
  }

  const popoverMenu = (
    <div style={{backgroundColor: "white", borderColor: "white", width: "500px", height: "420px", zIndex: "1000"}}>
      <Grid container direction="column" alignItems="center">
        <Grid item>
          <ReadyButton
            isAuth={user.userData ? user.userData.isAuth : false}
            timer={timer}
            ready={ready}
            cancelReady={cancelReady}
            readyStatus={readyStatus}/>
        </Grid>
      </Grid>

      <RoomList
        readyStatus={readyStatus}
        isAuth={user.userData ? user.userData.isAuth : false}
        userID={user.userData ? user.userData._id : ""}
        pageSize="2"/>
    </div>
  )

  if (loading) {
    return (
      <LoadingPage />
    )
  } else {
    return (
      <>
        {
          redirect ? (<Redirect to={roomLink} userRole={role.current} />) : ""
        }
        <div>
          <div className="container">
            <div className="box">
              <div className="column-title">
                <h1 style={{fontSize: "48px", fontWeight: "normal"}}>Client</h1>
                <h1 style={{fontSize: "20px", fontWeight: "normal"}}>Người ra lệnh</h1>
                <p className="content-hover">Mô tả ý muốn cho Agent để thực hiện những yêu cầu.<br/>
                </p>
              </div>
            </div>


            <div className="box1">
              <div className="column-title">
                <h1 style={{fontSize: "48px", fontWeight: "normal"}}>Agent</h1>
                <h1 style={{fontSize: "20px", fontWeight: "normal"}}>Agent nhận lệnh</h1>
                <p className="content-hover">Hỏi Client cho đến khi xác định đúng yêu cầu thì thôi.<br/>
                </p>
              </div>
            </div>
          </div>
        </div>

        <Grid container>
          <Grid item sm={4} style={{textAlign: "center"}}>
            <ConfirmModal
              socket={socket}
              visible={matchFound}
              roomType={content_type.current}
              notificationAudio={notificationAudio}
              promptStatus={promptStatus}
              promptDuration={promptDuration}
              setPromptStatus={setPromptStatus}
              handleOk={handleConfirmPromptModal}
              handleCancel={handleDenyPromptModal}/>
          </Grid>
        </Grid>
        
        <Grid container style={{marginTop: "30px"}}>
          <Grid item sm={12} md={6} style={{ padding: "30px", fontFamily:'"Open Sans",sans-serif' }}>
            <h1>Trang web này để làm gì?</h1>
          </Grid>

          <Grid item sm={12} md={6} style={{padding: "30px", fontSize: "16px"}}>
            Mình cần data cho đồ án tốt nghiệp. Trang web này lấy giọng nói của các bạn làm dữ liệu phục vụ cho nghiên cứu của mình. Mình cảm ơn vì sự hợp tác của các bạn.<br/>
          </Grid>
        </Grid>

        {/* Add some statistic down here! And some credits. */}

        <div className="landing-menu" 
          style={{
            position: "fixed", 
            bottom: "0px", 
            left: "50%",
            transform: "translate(-50%, 0%)",
            margin: "0 auto"}}>
          <Button onClick={openPopover} style={{border: "1px solid black", zIndex: "600"}}>
            {readyStatus ? timeConverter(timer) : "Bắt đầu"}
          </Button>
          <Popover
            open={popoverOpenStatus}
            anchorEl={anchorEl}
            onClose={closePopover}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}>
            {popoverMenu}
          </Popover>
        </div>
      </>
    )
  }
}

export default LandingPage
