import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

export const checkOutVisitor = functions.https.onRequest(async (req, res) => {
  // Enable CORS to allow requests from different devices
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).send(`
      <html>
        <body>
          <h1>Error</h1>
          <p>Method Not Allowed</p>
        </body>
      </html>
    `);
    return;
  }

  // Get the visitorId from the query parameter
  const visitorId = req.query['visitorId'] as string;

  if (!visitorId) {
    res.status(400).send(`
      <html>
        <body>
          <h1>Error</h1>
          <p>Missing visitorId parameter</p>
        </body>
      </html>
    `);
    return;
  }

  try {
    const visitorRef = db.collection('visitors').doc(visitorId);
    const visitorDoc = await visitorRef.get();

    if (!visitorDoc.exists) {
      res.status(404).send(`
        <html>
          <body>
            <h1>Error</h1>
            <p>Visitor not found</p>
          </body>
        </html>
      `);
      return;
    }

    const visitorData = visitorDoc.data();
    if (visitorData?.['checkOut']) {
      res.status(400).send(`
        <html>
          <body>
            <h1>Error</h1>
            <p>Visitor already checked out</p>
          </body>
        </html>
      `);
      return;
    }

    // Update the visitor document with the check-out time
    await visitorRef.update({
      checkOut: new Date(),
    });

    res.status(200).send(`
      <html>
        <body>
          <h1>Success</h1>
          <p>Visitor checked out successfully!</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Error checking out visitor:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Error</h1>
          <p>Internal Server Error</p>
        </body>
      </html>
    `);
  }
});