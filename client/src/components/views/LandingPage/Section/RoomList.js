import React, { useState } from 'react';
import  { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAllRooms } from '../../../../_actions/chatroom_actions';

import { Grid, Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination } from '@material-ui/core';

import RandomRoomButton from './RandomRoomButton';
import LoadingComponent from './../../Loading/LoadingComponent';
import ErrorInternalSystem from '../../Error/ErrorInternalSystem';


function RoomList(props) {

  const [ loading, setLoading ] = useState(true);
  const [ roomList, setRoomList ] = useState([]);
  const [ page, setPage ] = useState(0);
  const [ roomListShown, setRoomListShown ] = useState([]);
  const isAuth = props ? props.isAuth : false;
  const pageSize = props ? props.pageSize : 4;
  const userID = props ? props.userID : "";
  const readyStatus = props ? props.readyStatus : true;
  const dispatch = useDispatch();

  if (roomList.length === 0) {
    dispatch(getAllRooms())
    .then(response => {
      if (response.payload.success) {
        response.payload.roomFound.map(room => {
          room.capacity = 0
          if (room.user1 !== null) room.capacity++
          if (room.user2 !== null) room.capacity++
          if (!room.done && 
            (
              (room.client.includes(userID) && (room.user1 === userID || room.user1 === null)) || 
              (room.servant.includes(userID) && (room.user2 === userID || room.user2 === null))
            )
          ) {
            room.superPrior = 1;
          } else room.superPrior = 0;
          return room.key = room._id;
        })

        response.payload.roomFound.sort((a, b) => {
          if (a.superPrior < b.superPrior) return 11;
          else if (a.superPrior > b.superPrior) return -1;
          else {
            if (a.done && !b.done) return 1;
            else if (!a.done && b.done) return -1;
            else {
              if (a.name < b.name) return -1;
              else if (a.name > b.name) return 1;
              else return 0;
            }
          }
        })

        setRoomList(response.payload.roomFound.filter(room => room.done === false))
        setRoomListShown(response.payload.roomFound.filter(room => room.done === false).slice(page*pageSize, (page+1)*pageSize))
      } else {
        alert("Something's wrong with the server. We are very sorry for the inconvenience!")
      }
      setLoading(false);
    })
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setRoomListShown(roomList.slice(newPage*pageSize, (newPage+1)*pageSize))
  };

  if (loading) {
    return (
      <div style={{ height: "100px", textAlign: "center" }}>
        <LoadingComponent />
      </div>
      
    )
  } else if (roomList === null) {
    return (
      <>
        <ErrorInternalSystem />
      </>
    )
  } else {
    return (
      <>
        {
          roomList.length > 0 ? 
            !readyStatus ? (
              <>
                <Grid container direction="column" alignItems="center" style={{marginBottom: "10px"}}>
                  <Grid item>
                    <RandomRoomButton 
                      isAuth={isAuth}
                      userID={userID}/>
                  </Grid>
                </Grid>
              </>
          ) : (
            <Grid container direction="column" alignItems="center" style={{marginBottom: "10px", padding: "1px"}}>
              <Grid item>
                <Button disabled>Chọn phòng ngẫu nhiên</Button>
              </Grid>
            </Grid>
          ) : ""
        }
        <div style={{position: "absolute", bottom: "10px", width: "100%"}}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên phòng</TableCell>
                  <TableCell align="center">Người tham gia</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomListShown.map((room, index) => (
                  <TableRow key={`room_${index}`} style={{ background: room.superPrior === 1 ? "#F3F0AD" : "white" }}>
                    <TableCell component="th" scope="row" style={{ fontWeight: room.superPrior === 1 ? "bold" : "normal" }}>{room.name}</TableCell>
                    <TableCell align="center" style={{ fontWeight: room.superPrior === 1 ? "bold" : "normal" }}>{room.capacity}/2</TableCell>
                    <TableCell>
                      {
                        isAuth ? (
                          room.capacity === 2 ? (
                            <div style={{color: "grey"}}>Tham gia</div>
                          ) : 
                          readyStatus ? (
                            <div style={{color: "grey"}}>Tham gia</div>
                          ) : (
                            <Link to={`/chatroom/0/${room._id}`}>
                              Tham gia
                            </Link>
                          )
                        ) : (
                          <Link to={`/login`}>
                            Tham gia
                          </Link>
                        )
                      }
                    </TableCell>
                  </TableRow>
                  ) 
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[]}
            component="div"
            page={page}
            count={roomList.length}
            rowsPerPage={parseInt(pageSize, 10)}
            onChangePage={handleChangePage}/>
        </div>
      </>
    )
  }

}

export default RoomList