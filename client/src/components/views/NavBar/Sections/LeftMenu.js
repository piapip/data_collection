import React from 'react';
import { MenuItem, MenuList } from '@material-ui/core';
// import { Menu } from 'antd';
// const SubMenu = Menu.SubMenu;
// const MenuItemGroup = Menu.ItemGroup;

function LeftMenu(props) {
  return (
    // <Menu mode={props.mode}>

    // </Menu>
    <MenuList style={{display: "flex"}}>
      <MenuItem>Profile</MenuItem>
      <MenuItem>My account</MenuItem>
      <MenuItem>Logout</MenuItem>
    </MenuList>
  )
}

export default LeftMenu