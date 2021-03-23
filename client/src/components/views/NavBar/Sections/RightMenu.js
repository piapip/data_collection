/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
// import { Menu } from 'antd';
import { MenuItem, MenuList } from '@material-ui/core';
import axios from 'axios';
import { USER_SERVER } from '../../../Config';
import { withRouter, Link } from 'react-router-dom';
import { useSelector } from "react-redux";

function RightMenu(props) {

  // const idle = props ? props.idle : 0;
  // const inQueue = props ? props.inQueue : 0;
  // const inRoom = props ? props.inRoom : 0;
  const user = useSelector(state => state.user)

  const MenuItemStyle = {
    display: props.display,
  }

  const logoutHandler = () => {
    axios.get(`${USER_SERVER}/logout`).then(response => {
      if (response.status === 200) {
        props.history.push("/login");
      } else {
        alert('Log Out Failed')
      }
    });
  };

  if (user.userData && !user.userData.isAuth) {
    return (
      <>
        <MenuList >
          <MenuItem style={MenuItemStyle}>
            <Link to="/login">Login</Link>
          </MenuItem>
          <MenuItem style={MenuItemStyle}>
            <Link to="/register">Sign up</Link>
          </MenuItem>
        </MenuList>
      </>
    )
  } else {
    return (
      <>
        <MenuList >
          <MenuItem style={MenuItemStyle}>
            <a>Xin chào {user.userData && user.userData.name}</a>
          </MenuItem>
          <MenuItem style={MenuItemStyle}>
            <a onClick={logoutHandler}>Logout</a>
          </MenuItem>
        </MenuList>
      </>
    )
  }
}

export default withRouter(RightMenu);

