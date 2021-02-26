import React, { useState, useEffect } from 'react';

import { Input } from 'antd';
import LoadingComponent from './../../../Loading/LoadingComponent';

// const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function ProgressNote(props) {

  const scenario = props ? props.scenario : [];
  const progress = props ? props.progress : [];
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    if (scenario !== [] && progress !== []) {
      setLoading(false);
    } else setLoading(true);
  }, [scenario, progress]);

  const LABEL = ["Hành động", "Thiết bị", "Tầng", "Phòng", "", ""]

  let renderProgress = ""
  progress.map((property, index) => {
    if (property[1] >= 1) {
      return (
        renderProgress = renderProgress + `${LABEL[index]}: ${scenario[index][1]}\n`
      )
    } else {
      return "";
    }
  })

  return (
    <>
      {/* <h3 style={{textAlign: "center"}}>Ghi chú công việc đã làm được</h3> */}
      <h3 style={{fontWeight:'bold', fontSize:'18px', textAlign: "center"}}>Ghi chú</h3>
      {
        loading ? <LoadingComponent /> :
        (
        <TextArea 
          readOnly
          // style={{height: "200px", background: "transparent", border: "none"}}
          style={{height: "200px"}}
          spellCheck={false}
          value={renderProgress === "" ? "Chưa xác định được bất kì mục tiêu nào!" : renderProgress} />
        )
      }
    </>
  )
}
