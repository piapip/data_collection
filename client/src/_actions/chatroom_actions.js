import axios from 'axios';
import {
  GET_ONE,
  GET_ALL,
  GET_RANDOM,
  UPDATE_ROOM,
  DELETE_AUDIO,
  GET_CHEAT_SHEET,
} from './types';
import { ROOM_SERVER } from '../components/Config.js';

export function getRoom(roomID) {
  const request = 
    axios.get(`${ROOM_SERVER}/${roomID}`)
      .then(response => response.data);

  return {
    type: GET_ONE,
    payload: request
  }
}

export function getAllRooms() {
  const request = 
    axios.get(`${ROOM_SERVER}`)
      .then(response => response.data);

  return {
    type: GET_ALL,
    payload: request
  }
}

export function getRandomRoom(userID) {
  const request = 
    axios.get(`${ROOM_SERVER}/random/${userID}`)
      .then(response => response.data);

  return {
    type: GET_RANDOM,
    payload: request
  }
}

export function updateRoom(roomID, audioID) {
  const dataToSend = {
    roomID: roomID,
    audioID: audioID,
  }

  const request =
    axios.put(`${ROOM_SERVER}`, dataToSend)
      .then(response => response.data);

  return {
    type: UPDATE_ROOM,
    payload: request,
  }
}

export function removeLatestAudio(roomID, userRole) {
  const request =
    axios.put(`${ROOM_SERVER}/${roomID}/${userRole}`)
      .then(response => response.data);

  return {
    type: DELETE_AUDIO,
    payload: request,
  }
}

export function getCheatSheet(roomID) {
  const request =
    axios.get(`${ROOM_SERVER}/${roomID}/cheat`)
      .then(response => response.data);
  
  return {
    type: GET_CHEAT_SHEET,
    payload: request,
  }
}