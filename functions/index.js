const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_51R9jUuGj8OpeYr38Y8jz9x78zfRJD65jFgDeBOhG8Yjl5K1X8ctFiflWVzNsbzQiPKsoErWOr115tMwFfUijRlD800rNA8sWOA");

admin.initializeApp();
const db = admin.firestore();

// Existing checkOutVisitor function
exports.checkOutVisitor = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
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

  const visitorId = req.query.visitorId;

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
    const visitorRef = db.collection("visitors").doc(visitorId);
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
    if (visitorData && visitorData.checkOut) {
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

    await visitorRef.update({checkOut: new Date(),isCheckedIn: false});

    res.status(200).send(`
      <html>
        <body>
          <h1>Success</h1>
          <p>Visitor checked out successfully!</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error checking out visitor:", error);
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

// New createPaymentIntent function for Stripe
exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({error: "Method Not Allowed"});
    return;
  }

  const {amount, currency, visitorId} = req.body;

  if (!amount || !currency || !visitorId) {
    res.status(400).json({error: "Missing required parameters"});
    return;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      metadata: {visitorId},
    });
    res.json({clientSecret: paymentIntent.client_secret});
  } catch (error) {
    console.error("Error creating Payment Intent:", error);
    res.status(500).json({error: "Failed to create Payment Intent"});
  }
});
