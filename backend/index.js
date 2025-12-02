require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");
const port = process.env.PORT || 3000;
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString(
  "utf-8"
);
const serviceAccount = JSON.parse(decoded);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
// middleware
app.use(
  cors({
    origin: [process.env.CLIENT_DOMAIN],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(express.json());

// jwt middlewares
const verifyJWT = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  console.log(token);
  if (!token) return res.status(401).send({ message: "Unauthorized Access!" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.tokenEmail = decoded.email;
    console.log(decoded);
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ message: "Unauthorized Access!", err });
  }
};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    // --collection plants making--
    const db = client.db("plantsDB");
    const plantsCollection = db.collection("plants");
    const ordersCollection = db.collection("orders");

    // --create plant from seller--
    app.post("/plants", async (req, res) => {
      const plantData = req.body;
      console.log(plantData);
      const result = await plantsCollection.insertOne(plantData);
      res.send(result);
    });

    // --get data all plants of seller--
    app.get("/plants", async (req, res) => {
      const result = await plantsCollection.find().toArray();
      res.send(result);
    });

    // --get single plant--
    app.get("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const result = await plantsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // --payment integration---
    app.post("/create-checkout-session", async (req, res) => {
      const paymentInfo = req.body;

      app.post("/payment-success", async (req, res) => {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        const plant = await plantsCollection.findOne({
          _id: new ObjectId(session.metadata.plantId),
        });

        const order=await ordersCollection.findOne({
          transactionId:session.payment_intent
        })

        if (session.status === "complete" && plant && !order) {
          // save order data in db
          const orderInfo = {
            plantId: session.metadata.plantId,
            transactionId: session.payment_intent,
            customer: session.metadata.customer,
            status: "pending",
            seller: plant.seller,
            name: plant.name,
            category: plant.category,
            quantity: 1,
            price: session.amount_total / 100,
          };
          console.log(orderInfo);
          const result=await ordersCollection.insertOne(orderInfo)
        }
        res.send(plant)
      });

      // --session for payment--
      const session = await stripe.checkout.sessions.create({
        success_url: "https://example.com/success",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: paymentInfo?.name,
                description: paymentInfo?.description,
                images: [paymentInfo?.image],
              },
              unit_amount: paymentInfo?.price * 100,
            },
            quantity: paymentInfo?.quantity,
          },
        ],
        customer_email: paymentInfo?.customer?.email,

        mode: "payment",
        metadata: {
          plantId: paymentInfo?.plantId,
          customer: paymentInfo?.customer.email,
        },
        success_url: `${process.env.CLIENT_DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_DOMAIN}/plant/${paymentInfo?.plantId}`,
      });
      res.send({ url: session.url });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Server..");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
