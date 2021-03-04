import React, { useEffect, useRef } from 'react';

import { Col, Row, List } from "antd";
// import InfiniteScroll from 'react-infinite-scroller';
// import CustomAudioPlayer from './CustomAudioPlayer';
import AudioPlayerWithTranscript from './AudioPlayerWithTranscript';
import LoadingComponent from './../../../Loading/LoadingComponent';

export default function AudioList(props) {

  const transcript = props ? props.transcript : [];
  const audioList = props ? props.audioList : [];
  const userRole = props ? props.userRole : "";
  const audioEndRef = useRef(null);
  
  const scrollToBottom = () => {
    audioEndRef.current.scrollIntoView({ behaviour: "smooth", block: 'nearest', inline: 'start' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [audioList.length]);

  if (!props && userRole === "" && transcript.length !== audioList.length) {
    return <LoadingComponent />
  }

  return (
    <div
      style={{
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between", 
        height: "300px", 
        overflowX: "hidden", 
        overflowY: "scroll", 
        border: "1px solid #dedede"}}
    >
      <Row style={{marginLeft: "10px", marginRight: "10px"}}>
        <Col>
          <List
            itemLayout="horizontal"
            dataSource={audioList}
            renderItem={(audio, index) => {
              return (
                <div key={`audio_${index}`}>
                  <Row style={{
                    fontWeight: 'bold',
                    flexGrow: '1'}}>
                    <Col span={12} offset={((userRole === "client" && index % 2 === 0) || (userRole === "servant" && index % 2 === 1)) ? 12 : 0}>
                      <AudioPlayerWithTranscript
                        audioRole={index % 2 === 0 ? "Client" : "Servant"}
                        audioLink={audio}
                        autoPlay={false}
                        transcript={transcript[index]}/>
                    </Col>
                  </Row>
                </div>
              )
            }}>
          </List>
        </Col>
        
        <div ref={audioEndRef}/>
      </Row>
    </div>
  )
}


// const [ showData, setShowData ] = useState([]);
  // const [ mark, setMark ] = useState(0);
  // const [ loading, setLoading ] = useState(false);
  // const [ hasMore, setHasMore ] = useState(true);

  // useEffect(() => {
  //   if(audioList.length < 4) {
  //     setShowData(audioList);
  //     setHasMore(false);
  //   } else {
  //     // let newSet = showData;
  //     // newSet.push(audioList.slice(mark*4, (mark+1)*4));
  //     setShowData(audioList.slice(0, 4));
  //     setMark(1);
  //   }
  // }, [audioList]);

  // const handleLoadMore = () => {
  //   let newSet = showData;
  //   setLoading(true);
  //   if (newSet.length >= audioList.length - 4) {
  //     let newList = audioList;
  //     setShowData(newList);
  //     setHasMore(false);
  //     setLoading(false);
  //     return;
  //   } else {
  //     let newSet = showData;
  //     newSet.push(audioList.slice(mark*4, (mark+1)*4));
  //     setShowData(newSet);
  //     setMark(mark + 1);
  //     setLoading(false);
  //   }
  // }
  
  // const showAudio = props ? (
  //   props.audioList ? props.audioList.map((audio, index) => {
  //     return (
  //       // <div key={audio}>
  //       //   <audio
  //       //     controls="controls"
  //       //     src={audio}>
  //       //   <track kind="captions"/>
  //       //   </audio>
  //       // </div>
  //       // <div key={`audio_${index}`}>
  //       //   <Row 
  //       //     type="flex"
  //       //     style={{ alignItems: "center", marginTop: "7px", marginBottom: "7px" }}
  //       //     justify="center"
  //       //     gutter={10}>
  //       //     <Col span={4} style={{textAlign: "center"}}>
  //       //       <div>
  //       //         {index % 2 === 0 ? "C" : "S"}
  //       //       </div>
  //       //     </Col>
  //       //     <Col span={20}>
  //       //       <CustomAudioPlayer audioLink={audio} autoPlay={false}/>
  //       //     </Col>
  //       //   </Row>
  //       // </div>
  //       <div key={`audio_${index}`}>
  //         <Row style={{fontWeight: 'bold', flexGrow: '1', alignItems: "left"}}>
  //           <Col span={12} offset={12}>
  //             <AudioPlayerWithTranscript
  //               audioRole={index % 2 === 0 ? "Client" : "Servant"}
  //               audioLink={audio}
  //               autoPlay={false}
  //               transcript={transcript[index]}/>
  //           </Col>
  //         </Row>
  //       </div>
  //     )
  //   }) : "") : ""