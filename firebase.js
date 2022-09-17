const admin = require("firebase-admin");
const { getMessaging } = require('firebase-admin/messaging')
// const { getAuth } = require('firebase-admin/auth')
const serviceAccount = require("./config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function verifyFCMToken (fcmToken) {
  admin.messaging().send({
      token: fcmToken
  }, true)
  .then(result => {
    return true //validate
  })
  .catch(err => {
    return true //invalidate
})
}

/* 
 message {
  data: {data},
  tokens: [registrationTokens],
}
*/
async function sendMulticastMessage(message){
  getMessaging().sendMulticast(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
}

/* 
 message {
  data: {data},
  tokens: registrationToken,
}
*/
async function sendUnicastMessage(message){
  getMessaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
}

module.exports={
  verifyFCMToken,
  sendMulticastMessage,
  sendUnicastMessage
}