import axios from 'axios';
import {
  GET_TRANSCRIPT,
  FIX_TRANSCRIPT
} from './types';
import { AUDIO_SERVER } from '../components/Config.js';

export function getTranscript(audioLink, audioID) {
  const dataToSend = {
    audioLink: audioLink,
	  audioID: audioID,
  }

  const request =
    axios.put(`${AUDIO_SERVER}/transcript`, dataToSend)
      .then(response => response.data);

  return {
    type: GET_TRANSCRIPT,
    payload: request
  }
}

export function fixTranscript(audioID, userID, transcript) {
  const dataToSend = {
    transcript: transcript
  }
  const request = 
    axios.put(`${AUDIO_SERVER}/${audioID}/${userID}`, dataToSend)
      .then(response => response.data);

    return {
      type: FIX_TRANSCRIPT,
      payload: request
    }
}