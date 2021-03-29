import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

function LeftMenu(props) {
  return (
    <MenuList style={{display: "flex"}}>
      <MenuItem>Profile</MenuItem>
      <MenuItem>My account</MenuItem>
      <MenuItem>Logout</MenuItem>
    </MenuList>
  )
}

export default LeftMenu