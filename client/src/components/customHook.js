import { useState, useEffect } from 'react';
import axios from 'axios';
import * as serviceWorker from './../serviceWorker';
import { BACKEND_URL } from './Config';

// check push notifications are supported by the browser
const pushNotificationSupported = serviceWorker.isPushNotificationSupported();

export default function customHook() {
  // to manage the user consent: Notification.permission is a JavaScript native function that return the current state of the permission
  // We initialize the userConsent with that value
  const [ userConsent, setSuserConsent ] = useState(Notification.permission);

  // to manage the use push notification subscription
  const [ userSubscription, setUserSubscription ] = useState(null);

  //to manage the push server subscription
  const [ pushServerSubscriptionId, setPushServerSubscriptionId ] = useState();

  //to manage errors
  const [ error, setError ] = useState(null);

  //to manage async actions
  const [ loading, setLoading ] = useState(true);

  // if the push notifications are supported, registers the service worker
  // this effect runs only in the first render
  useEffect(() => {
    if (pushNotificationSupported) {
      setLoading(true);
      setError(false);
      serviceWorker.register();
    }
  }, []);

  // Check if there is any push notification subscription for the registered service worker
  // this use effect runs only in the first render
  useEffect(() => {
    setLoading(true);
    setError(false);
    const getExistingSubscription = async () => {
      const existingSubscription = await serviceWorker.getUserSubscription();
      setUserSubscription(existingSubscription);
      setLoading(false);
    };
    getExistingSubscription();
  }, []);

  /**
   * define a click handler that asks the user permission,
   * it uses the setSuserConsent state, to set the consent of the user
   * If the user denies the consent, an error is created with the setError hook
   */
  const onClickAskUserPermission = () => {
    setLoading(true);
    setError(false);
    serviceWorker.askUserPermission().then((consent) => {
      setSuserConsent(consent);
      if (content !== 'granted') {
        setError({
          name: 'Consent denied',
          message: 'The server is not allowed to send notifications to you.',
          code: 0
        });
      }
      setLoading(false);
    });
  };

  /**
   * define a click handler that creates a push notification subscription.
   * Once the subscription is created, it uses the setUserSubscription hook
   */
  const onClickSubscribeToPushNotification = () => {
    setLoading(true);
    setError(false);
    serviceWorker
      .createNotificationSubscription()
      .then((subscription) => {
        setUserSubscription(subscription);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Couldn't create the notification subscription",
          err,
          'name:',
          err.name,
          'message:',
          err.message,
          'code:',
          err.code
        );
        setError(err);
        setLoading(false);
      });
  };

  /**
   * define a click handler that sends the push susbcribtion to the push server.
   * Once the subscription is created on the server, it saves the id using the hook setPushServerSubscriptionId
   */
  const onClickSendSubscriptionToPushServer = () => {
    setLoading(true);
    setError(false);
    axios.post(`${BACKEND_URL}/subscription`, { data: userSubscription })
    .then((response) => {
      setPushServerSubscriptionId(response.data.id);
      setLoading(false);
    })
    .catch((err) => {
      setLoading(false);
      setError(err);
    })
  };

  /**
   * define a click handler that requests the push server to send a notification, passing the id of the saved subscription
   */
  const onClickSendNotification = async () => {
    setLoading(true);
    setError(false);
    axios.get(`${BACKEND_URL}/subscription/${pushServerSubscriptionId}`)
    .catch((err) => {
      setLoading(false);
      setError(err);
    });
    setLoading(false);
  };

  return {
    onClickAskUserPermission,
    onClickSubscribeToPushNotification,
    onClickSendSubscriptionToPushServer,
    pushServerSubscriptionId,
    onClickSendNotification,
    userConsent,
    pushNotificationSupported,
    userSubscription,
    error,
    loading,
  };
}