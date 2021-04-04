import React, { useState } from 'react';
import { useDispatch } from "react-redux";

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@material-ui/icons/ThumbDownOutlined';
import VolumeUpOutlinedIcon from '@material-ui/icons/VolumeUpOutlined';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

import { fixTranscript } from '../../../../../_actions/audio_actions';
import LoadingComponent from './../../../Loading/LoadingComponent';

export default function AudioPlayerWithTranscript(props) {

  const dispatch = useDispatch();
  const userID = props ? props.userID : "";
  const roomID = props ? props.roomID : "";
  const username = props ? props.username : "";
  const index = props ? props.index : -1;
  let socket = props ? props.socket : null;
  const backgroundColor = props ? props.backgroundColor : "none";

  const audioLink = props ? props.audioLink : "";
  const offset = props ? props.offset : "left";
  const audioRole = props ? props.audioRole : "Loading...";
  let transcript = props ? props.transcript : {};

  if (transcript && (transcript.content === "" || transcript.content === " ")) transcript.content = "...";

  const [ editMode, setEditMode ] = useState(false);
  const [ editContent, setEditContent ] = useState(transcript ? transcript.content : "...");

  const [ playbackMode, setPlaybackMode ] = useState(false);

  const getAudioFormat = (() => {
    const preferredFormat = 'audio/ogg; codecs=opus';
    const audio = document.createElement('audio');
    const format = audio.canPlayType(preferredFormat)
      ? preferredFormat
      : 'audio/wav';
    return format;
  })

  const onSaveTranscript = () => {
    if(transcript) {
      dispatch(fixTranscript(transcript.audioID, userID, editContent))
      .then(response => {
        if (response.payload.success) {
          // emit a signal here
          setEditMode(false);
          if (socket) {
            socket.emit("fix transcript", {
              roomID,
              username,
              editContent,
              index
            })
          }
        } else {
          alert("Something's wrong with the server. Please not using this function for now.")
        }
      })
    } else {
      setEditMode(false);
    }

    // setEditMode(false)
  }

  const renderAudio = (
    <>
      <audio 
        controls
        key={audioLink}
        preload="auto"
        style={{ display: playbackMode ? "block" : "none", height: "30px", width: editMode ? "344px" : ""  }}
      >
        <source src={audioLink} type={getAudioFormat()}/>
      </audio>
    </>
  )

  // const renderEditButton = (
  //   <button style={{backgroundColor: "transparent"}} onClick={() => {
  //     setEditContent(transcript ? transcript.content : "...")
  //     setEditMode(true)
  //   }}><EditIcon fontSize="small"/></button>
  // )

  if (audioLink === undefined || audioLink === null) return "";

  if (
    socket === null ||
    roomID === "" ||
    userID === "" ||
    username === "" ||
    audioLink === "" ||
    audioRole === "Loading..." ||
    JSON.stringify(transcript) === JSON.stringify({})) {
    return <LoadingComponent />
  }

  return (
    <>
    <Grid container 
      style={{ margin: "10px 5px" }} 
      justify={offset === "right" ? "flex-end" : "flex-start"}>
        {/* {
          (!editMode && offset === "left") ? (
            <Grid item style={{ marginRight: "7px", alignItems: "center" }}>
              {renderEditButton}
            </Grid>
          ) : ""
        } */}
        
        <Grid item>
          <Grid container style={{ display: "inline-block" }}>
            <Grid container style={{ padding: "10px 10px 15px", border: "1px solid #dedede", borderRadius: "16px", backgroundColor: backgroundColor }}>
              <Grid item>
                {/* <Grid container>
                  {(transcript && transcript.yours) ? <p>Bạn</p> : <p>{audioRole}</p>}
                </Grid> */}
                <Grid container>
                  {
                    editMode ? (
                      <div>
                        <Input value={editContent} onChange={(e) => {
                          console.log(e.target.value);
                          setEditContent(e.target.value);
                        }}/>
                        {
                          transcript ? (
                            editContent === transcript.content ? (
                              <Button disabled>Lưu</Button>
                            ) : <Button onClick={() => onSaveTranscript()}>Lưu</Button>
                          ) : (
                            editContent === "..." ? (
                              <Button disabled>Lưu</Button>
                            ) : (
                              <Button onClick={() => onSaveTranscript()}>Lưu</Button>
                            )
                          ) 
                        }

                        <Button onClick={() => setEditMode(false)}>Hủy</Button>
                      </div>
                    ) : (
                      <div>
                        {transcript ? (
                          `${transcript.content}`
                        ): "---"}
                      </div>
                    )
                  }
                </Grid>
              </Grid>
            </Grid>

            {/* <Grid container>
              <Grid item>
                {
                  editMode ? "" : (
                    <i style={{paddingLeft: "10px", paddingRight: "10px"}}>{
                      transcript ? `Fix by ${transcript.fixBy}` : "---"
                    }</i>
                  )
                }
              </Grid>
            </Grid> */}
          </Grid>
        </Grid>

        {
          transcript ? (
            offset === "left" ? (
              <Grid container alignItems="center" justify="flex-start">
                <IconButton disabled={editMode} onClick={() => {
                  onSaveTranscript()
                }}>
                  {
                    (!editMode && transcript.fixBy !== "ASR Bot") ? <ThumbUpIcon color="primary"/> : <ThumbUpOutlinedIcon />
                  }
                </IconButton>
                <IconButton disabled={editMode} onClick={() => {
                  setEditContent(transcript ? transcript.content : "...")
                  setEditMode(true)
                }}>
                  <ThumbDownOutlinedIcon/>
                </IconButton>
                <IconButton onClick={() => {
                  setPlaybackMode(!playbackMode);
                }}>
                  { playbackMode ? <CloseIcon /> : <VolumeUpOutlinedIcon /> }
                </IconButton>
                {renderAudio}
              </Grid>
            ) : (
              <Grid container alignItems="center" justify="flex-end">
                {renderAudio}
                <IconButton onClick={() => {
                  setPlaybackMode(!playbackMode);
                }}>
                  { playbackMode ? <CloseIcon /> : <VolumeUpOutlinedIcon /> }
                </IconButton>
                <IconButton disabled={editMode} onClick={() => {
                  onSaveTranscript()
                }}>
                  {
                    (!editMode && transcript.fixBy !== "ASR Bot") ? <ThumbUpIcon color="primary"/> : <ThumbUpOutlinedIcon />
                  }
                </IconButton>
                <IconButton disabled={editMode} onClick={() => {
                  setEditContent(transcript ? transcript.content : "...")
                  setEditMode(true)
                }}>
                  <ThumbDownOutlinedIcon/>
                </IconButton>
              </Grid>
            )
            
          ) : ""
        }
        {/* {
          (!editMode && offset === "right") ? (
            <Grid item style={{ marginLeft: "7px", alignItems: "center" }}>
              {renderEditButton}
            </Grid>
          ) : ""
        } */}
        
      </Grid>
    </>
  )
}
