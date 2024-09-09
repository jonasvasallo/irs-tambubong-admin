// Import Firebase Admin SDK and functions from Firebase Functions
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin SDK (only once)
admin.initializeApp();

// Define the cloud function to send FCM notifications
exports.sendIncidentNotification = onRequest(async (req, res) => {
  const topic = 'incident-alert';

  // Define the notification payload
  const message = {
    notification: {
      title: 'INCIDENT ALERT!',
      body: 'An incident has been confirmed by the authorities.',
    },
    topic: topic,
  };

  // Try to send the message
  try {
    const response = await admin.messaging().send(message);
    logger.info('Successfully sent message:', response);
    res.status(200).send('Notification sent successfully');
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).send('Error sending notification');
  }
});

// Define the cloud function to send FCM notifications to a specific user
exports.sendUserNotification = onRequest((req, res) => {
  cors(req, res, async () => {
    const { userId } = req.body; // Pass the userId via request body

    try {
      // Fetch the user's document from Firestore using the userId
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        res.status(404).send('User not found');
        return;
      }

      // Get the FCM token from the user's document
      const fcmToken = userDoc.data().fcmToken;
      
      if (!fcmToken) {
        res.status(400).send('No FCM token found for this user');
        return;
      }

      // Define the notification payload
      const message = {
        notification: {
          title: 'An incident has been assigned to you!',
          body: 'You were given an incident to respond to. Click this notification to go straight to the app.',
        },
        token: fcmToken, // Send to the user's FCM token
      };

      // Send the notification
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      res.status(200).send('Notification sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).send('Error sending notification');
    }
  });
});
