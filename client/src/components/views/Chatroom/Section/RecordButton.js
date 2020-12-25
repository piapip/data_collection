import React, {useState} from 'react';
import ReactRecord from 'react-record';
import {Button} from 'antd';
// @ant-design/icons doesn't work...
// import { AudioOutlined } from '@ant-design/icons';

export default function RecordButton() {
    const id = 81;

    return (
        <div>
            <div className="primary-button stop  track-fs-speak-record">

                <button type='button'>
                    <svg width="29" height="28" viewBox="0 0 29 28">
                        <defs>
                            <path
                                id={'mic-path' + id}
                                d="M9.333 18.667A4.68 4.68 0 0 0 14 14V4.667A4.68 4.68 0 0 0 9.333 0a4.68 4.68 0 0 0-4.666 4.667V14a4.68 4.68 0 0 0 4.666 4.667zM7 4.667a2.34 2.34 0 0 1 2.333-2.334 2.34 2.34 0 0 1 2.334 2.334V14a2.34 2.34 0 0 1-2.334 2.333A2.34 2.34 0 0 1 7 14V4.667zm11.667 7V14c0 4.783-3.617 8.633-8.167 9.217v2.45H14c.7 0 1.167.466 1.167 1.166S14.7 28 14 28H4.667c-.7 0-1.167-.467-1.167-1.167s.467-1.166 1.167-1.166h3.5v-2.45C3.617 22.633 0 18.667 0 14v-2.333c0-.7.467-1.167 1.167-1.167s1.166.467 1.166 1.167V14c0 3.85 3.15 7 7 7s7-3.15 7-7v-2.333c0-.7.467-1.167 1.167-1.167s1.167.467 1.167 1.167z"
                            />
                        </defs>
                        <g fill="none" fillRule="evenodd" transform="translate(5)">
                            <mask id={'mic-mask' + id} fill="#fff">
                                <use xlinkHref={'#mic-path' + id}/>
                            </mask>
                            <use xlinkHref={'#mic-path' + id}/>
                            <g fill="#FF4F5E" mask={`url(#mic-mask${id})`}>
                                <path d="M-5 0h28v28H-5z"/>
                            </g>
                        </g>
                    </svg>
                    <div className="background"/>
                </button>

            </div>

            <svg width="28" height="28" viewBox="0 0 28 28">
                <defs>
                    <path
                        id={'stop-path' + id}
                        d="M19.833 0H3.5C1.517 0 0 1.517 0 3.5v16.333c0 1.984 1.517 3.5 3.5 3.5h16.333c1.984 0 3.5-1.516 3.5-3.5V3.5c0-1.983-1.516-3.5-3.5-3.5zM21 19.833c0 .7-.467 1.167-1.167 1.167H3.5c-.7 0-1.167-.467-1.167-1.167V3.5c0-.7.467-1.167 1.167-1.167h16.333c.7 0 1.167.467 1.167 1.167v16.333z"
                    />
                </defs>
                <g fill="none" fillRule="evenodd" transform="translate(2.333 2.333)">
                    <mask id={'stop-mask' + id} fill="#fff">
                        <use xlinkHref={'#stop-path' + id}/>
                    </mask>
                    <g fill="#FF4F5E" mask={`url(#stop-mask${id})`}>
                        <path d="M-2.333-2.333h28v28h-28z"/>
                    </g>
                </g>
            </svg>
        </div>


    )
    // const [ isRecording, setIsRecording ] = useState(false)
    // const [ audioURL, setAudioURL ] = useState(null)
    //
    // return (
    //   <>
    //   <ReactRecord
    //     record={isRecording}
    //     onData={recordedBlob => console.log('chunk of data is: ', recordedBlob)}
    //     onSave={blobObject => console.log("Call onSave call back here, ", blobObject)}
    //     onStart={() => console.log("Call the onStart callback here")}
    //     onStop={blobObject => {
    //       console.log('blobObject is: ', blobObject);
    //       setAudioURL(blobObject.blobURL)
    //     }}>
    //     <div>
    //       <audio
    //         controls="controls"
    //         src={audioURL}>
    //         <track kind="captions" />
    //       </audio>
    //     </div>
    //     { isRecording ?
    //           <Button
    //             className="record-button"
    //             type="danger"
    //             shape="circle"
    //             size="large"
    //             onClick={() => setIsRecording(false)} >Stop</Button> :
    //           <Button
    //             className="record-button"
    //             // type="danger"
    //             shape="circle"
    //             size="large"
    //             onClick={() => setIsRecording(true)} >Start</Button>}
    //   </ReactRecord>
    //
    //   </>
    // )
}