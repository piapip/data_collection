import React, { useEffect } from 'react';
import { Prompt } from 'react-router-dom';

export default function PromptLeaving(props) {

  const when = props ? props.when : true;

  const onLeave = () => {
    props.onLeave()
  }

  // This "when" here is crucial, it will back up the flaw of react's useHistory (f5 and the prompt vvvvvvvvvvvvv down here won't work for the next f5).
  // The reason why is: (I suppose)
  //  When we use useEffect(() => {...some stuff...}, []), the page won't run the "some stuff" the first time we f5, which lead to the prompt ain't gonna work for the next f5.
  //  However with the mark [when] and if (when), the we make sure that the "some stuff" will run every time the page is loaded/reloaded. 
  useEffect(() => {
    if (when) {
      window.addEventListener('beforeunload', alertUser);
      window.addEventListener('unload', onLeave);
      return () => {
        window.removeEventListener('beforeunload', alertUser);
        window.removeEventListener('unload', onLeave);
        onLeave();
      }
    }
  }, [when])

  const alertUser = e => {
    e.preventDefault()
    e.returnValue = ''
  }

  return (
    <Prompt
      when={when}
      message={(location, action) => {
        if (action === 'POP') {
          console.log("Backing up...")
        }

        return location.pathname.startsWith("/app")
          ? true
          : `Are you sure?`
      }}
    />
  )
}
