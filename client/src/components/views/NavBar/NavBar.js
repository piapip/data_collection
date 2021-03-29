import React, { useState } from 'react';

import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';

import RightMenu from './Sections/RightMenu';
import './Sections/Navbar.css';

const drawerWidth = 180;
const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
}));


function NavBar() {

  const classes = useStyles();
  const [visible, setVisible] = useState(false)

  const showDrawer = () => {
    setVisible(true)
  };

  const onClose = () => {
    setVisible(false)
  };

  return (
    <nav className="menu" style={{ position: 'fixed', zIndex: 5, width: '100%', top: 0 }}>
      <div className="menu__logo">
        <a href="/">SLU</a>
      </div>

      <div className="menu__container">
        <div className="menu_right">
          <RightMenu display="inline-block" />
        </div>

        <IconButton
          className="menu__mobile-button"
          type="primary"
          onClick={showDrawer}
        >
          <MenuIcon />
        </IconButton>
        <nav className={classes.drawer} aria-label="mailbox folders">
          <Hidden smUp implementation="css">
            <Drawer
              variant="temporary"
              anchor={'right'}
              onClose={onClose}
              open={visible}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, 
              }}>
              <RightMenu display="block" />
            </Drawer>
          </Hidden>
        </nav>
      </div>
    </nav>
  )
}

export default NavBar