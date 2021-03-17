import {
  GET_TRANSCRIPT,
  FIX_TRANSCRIPT
} from '../_actions/types';

export default function(state={}, action) {
  switch(action.type){
    case GET_TRANSCRIPT:
      return {...state}
    case FIX_TRANSCRIPT:
      return {...state, audioUpdated: action.payload}
  }
}