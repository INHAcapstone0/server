const admin = require("firebase-admin");
const { getMessaging } = require('firebase-admin/messaging')
// const { getAuth } = require('firebase-admin/auth')
const serviceAccount = require("./config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function verifyFCMToken (fcmToken) {
  return admin.messaging().send({
      token: fcmToken
  }, true)
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
  token: registrationToken,
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