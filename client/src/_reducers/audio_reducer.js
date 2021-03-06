import { 
  FIX_TRANSCRIPT
} from '../_actions/types';

export default function(state={}, action) {
  switch(action.type){
    case FIX_TRANSCRIPT:
      return {...state, audioUpdated: action.payload}
  }
}