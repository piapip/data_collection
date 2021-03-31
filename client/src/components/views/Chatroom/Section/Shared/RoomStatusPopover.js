import React from 'react';

// import LoadingComponent from './../../../Loading/LoadingComponent';
import Button from '@material-ui/core/Button';

export default function RoomStatusPopover() {
  
  // const content = (
  //   <LoadingComponent />
  // );

  return (
    <>
      {
        <div style={{paddingTop: "10px"}}>
          <Button style={{ width: "20px", height: "60px", fontSize: "30px", border: "1px solid #dedede" }}>
            <span style={{minHeight: "50px", verticalAlign: "middle", display: "inline-flex"}}>||</span>
          </Button>
        </div>
      }
      {/* <Affix offsetTop={120}>
        <div style={{paddingTop: "10px"}}>
          <Popover placement="right" content={props ? props.content : content} trigger="click">
            <Button style={{width: "20px", height: "60px", fontSize: "30px", }}>
              <span style={{minHeight: "50px", verticalAlign: "middle", display: "inline-flex"}}>||</span>
            </Button>
          </Popover>  
        </div>
      </Affix> */}
    </>
  )
}
