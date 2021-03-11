/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Menu } from 'antd';
import axios from 'axios';
import { USER_SERVER } from '../../../Config';
import { withRouter, Link } from 'react-router-dom';
import { useSelector } from "react-redux";

function RightMenu(props) {

  const idle = props ? props.idle : 0;
  const inQueue = props ? props.inQueue : 0;
  const inRoom = props ? props.inRoom : 0;
  const user = useSelector(state => state.user)

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
      <Menu mode={props.mode}>
        <Menu.Item key="stat">
          <a><span className="dot dot_idle"></span> {idle} <span className="dot dot_inQueue"></span> {inQueue} <span className="dot dot_inRoom"></span> {inRoom}</a>
        </Menu.Item>
        <Menu.Item key="mail">
          <Link to="/login">Signin</Link>
        </Menu.Item>
        <Menu.Item key="app">
          <Link to="/register">Signup</Link>
        </Menu.Item>
      </Menu>
    )
  } else {
    return (
      <Menu mode={props.mode}>
        <Menu.Item key="stat">
          <a><span className="dot dot_idle"></span> {idle} <span className="dot dot_inQueue"></span> {inQueue} <span className="dot dot_inRoom"></span> {inRoom}</a>
        </Menu.Item>
        <Menu.Item>
          <a>Xin chào {user.userData && user.userData.name}</a>
        </Menu.Item>
        <Menu.Item key="logout">
          <a onClick={logoutHandler}>Logout</a>
        </Menu.Item>
      </Menu>
    )
  }
}

export default withRouter(RightMenu);

