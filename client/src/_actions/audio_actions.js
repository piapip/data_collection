import axios from 'axios';
import {
  FIX_TRANSCRIPT
} from './types';
import { AUDIO_SERVER } from '../components/Config.js';

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