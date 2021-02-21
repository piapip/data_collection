import React from 'react';
import './RecordButton.css';
import ReactRecord from 'react-record';
// import {StopIcon,MicIcon} from '../../../../ui/icons';
import { StopIcon, MicIcon } from '../../../../ui/icons';

export default function RecordButton(props) {

    const isRecording = props ? props.isRecording : false;
    const turn = props ? props.turn : false;
    const socket = props ? props.socket : null;
    const roomID = props ? props.roomID : "";

    const renderRecordingButton = (
        turn ? (
            isRecording ? (
                <button onClick={() => props.setIsRecording(false)} className="primary-button button" type="button">
                    <StopIcon/>
                </button> 
            ) : (
                <button onClick={() => props.setIsRecording(true)} className="primary-button button" type="button">
                    <MicIcon/>
                </button>
            )
        ) : (
            <button onClick={() => alert("Yo")} style={{cursor: 'not-allowed'}} disabled>
                <MicIcon />
            </button>
        )
    )

    return (
        <div style={{margin: '4rem auto'}}>
            <div className="primary-button">
                <ReactRecord
                    record={isRecording}
                    onData={() => {}}
                    onSave={() => {}}
                    onStart={() => {
                        if (socket) {
                            socket.emit('Recording', {
                                roomID,
                            });
                        }
                    }}
                    onStop={blobObject => {
                        props.setAudio(blobObject);
                        if (socket) {
                            socket.emit('Done Recording', {
                                roomID,
                            });
                        }
                    }}>
                    {renderRecordingButton}
                </ReactRecord>
                <div className="primary-button background"/>
            </div>
        </div>
    )
}
