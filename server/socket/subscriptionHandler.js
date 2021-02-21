const subscriptions = {};
var crypto = require('crypto');
const webpush = require('web-push');

const vapidKeys = {
  privateKey: 'toPnPf6CVFoZvOkoVR9-dCtnXdf6feKoyUAAAC_LJFk',
  publicKey: 'BNMtEkDR6eqNNSdAsQnv0SBgtoNDSKAKq_r0NIcB8oqYfeOuasOgfsKO1LTkFaCPyFJetjfIlBUpVuer1zp6fA8',
};
  
webpush.setVapidDetails('mailto:example@yourdomain.org', vapidKeys.publicKey, vapidKeys.privateKey);

const createHash = (input) => {
  const md5sum = crypto.createHash('md5');
  md5sum.update(Buffer.from(input));
  return md5sum.digest('hex');
}

const handlePushNotificationSubscription = (req, res) => {
  const subscriptionRequest = req.body.data;
  const susbscriptionId = createHash(JSON.stringify(subscriptionRequest));
  subscriptions[susbscriptionId] = subscriptionRequest;
  res.status(201).json({ id: susbscriptionId });
}

const sendPushNotification = (req, res) => {
  const subscriptionId = req.params.id;
  const pushSubscription = subscriptions[subscriptionId];
  webpush
    .sendNotification(
      pushSubscription,
      JSON.stringify({
        title: 'Fake title',
        text: 'Fake text',
        data: 'Fake data',
        tag: 'Fake tag',
      })
    )
    .catch((err) => {
      console.log(err);
    });

  res.status(202).json({});
}

module.exports = {handlePushNotificationSubscription, sendPushNotification};