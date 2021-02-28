import React from 'react';

import { Menu, Button } from 'antd';

const { SubMenu } = Menu;

export default function LandingMenu() {
  const handleClick = e => {
    console.log('click ', e);
  };

  return (
    <Menu
        onClick={handleClick}
        style={{ width: 256 }}
        defaultSelectedKeys={[]}
        defaultOpenKeys={[]}
        mode="inline"
      >
      <SubMenu key="sub1" title="Bắt đầu!">
        <Button>Yo</Button>
      </SubMenu>
    </Menu>
  )
}
