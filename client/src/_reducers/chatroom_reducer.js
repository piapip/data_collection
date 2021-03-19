import {
  GET_ONE,
  GET_ALL,
  GET_RANDOM,
  UPDATE_ROOM,
  DELETE_AUDIO,
  GET_CHEAT_SHEET,
} from '../_actions/types'

export default function(state={}, action){
  switch(action.type){
    case GET_ALL:
      return {...state, rooms: action.payload}
    case GET_ONE: 
    case GET_RANDOM:
      return {...state, roomFound: action.payload}
    case UPDATE_ROOM:
      return {...state}
    case DELETE_AUDIO:
      return {...state, success: action.payload}
    case GET_CHEAT_SHEET:
      return {...state, cheatSheet: action.payload}
  }
}