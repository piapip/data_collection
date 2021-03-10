import React from 'react';

import { Affix, Popover, Button } from 'antd';

import LoadingComponent from './../../../Loading/LoadingComponent';

export default function RoomStatus(props) {
  
  const content = (
    <LoadingComponent />
  );

  return (
    <>
       <Affix offsetTop={120}>
        <div style={{paddingTop: "10px"}}>
          <Popover placement="right" content={props ? props.content : content} trigger="click">
            <Button style={{width: "20px", height: "60px", fontSize: "30px", }}>
              <span style={{minHeight: "50px", verticalAlign: "middle", display: "inline-flex"}}>||</span>
            </Button>
          </Popover>  
        </div>
      </Affix>
    </>
  )
}
