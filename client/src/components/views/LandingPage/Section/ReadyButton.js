import React from 'react';
import  { Link } from "react-router-dom";

import { Grid, Button } from '@material-ui/core';

export default function ReadyButton(props) {
  
  const isAuth = props ? props.isAuth : false;

  const timeConverter = (seconds) => {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60

    return [hours, minutes, seconds % 60].map(format).join(':')
  }

  return (
    <>
      <Grid container direction="column" justify="center">
        <Grid item>
          {isAuth ? (
            !props.readyStatus ? (
              <div style={{ marginTop: "45px", marginBottom: "45px" }}>
                <Grid container>
                  <Button onClick={props.ready} style={{ borderRadius: "8", border: "1px solid #dedede" }}>
                    Sẵn sàng
                  </Button>
                </Grid>
                <Grid container justify="center">
                  00:00:00
                </Grid>
                <Grid container>
                  
                </Grid>
              </div>
            ) : (
              <div style={{marginTop: "45px", marginBottom: "45px"}}>
                <Grid container>
                  <Button onClick={props.cancelReady} style={{ borderRadius: "8", border: "1px solid #dedede" }}>
                    Dừng tìm kiếm
                  </Button>
                </Grid>
                <Grid container justify="center">
                  Đang tìm bạn: {timeConverter(props ? props.timer : 0)}
                </Grid>
              </div>
              
            )) : (
              <Link to={`/login`}>
                <Grid container>
                  <Button style={{ marginTop: "45px", marginBottom: "45px", borderRadius: "8", border: "1px solid #dedede" }}>Sẵn sàng</Button>
                </Grid>
              </Link>
            )
          }
        </Grid>
      </Grid>
    </>
  )
}
