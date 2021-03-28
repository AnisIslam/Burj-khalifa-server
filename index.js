const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
console.log(process.env.DB_PASS, process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ldzw.mongodb.net/burjAlKhalifa?retryWrites=true&w=majority`;

const port = 3001;

const app = express()

app.use(cors());
app.use(express.json());

const serviceAccount = require("./burj-al-arab-23f78-firebase-adminsdk-36604-6f0ed28374.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: 'https://burj-al-arab-23f78.firebaseio.com'
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  // Add Booking section in booking page

  // POST section // Create
  const bookings = client.db("burjAlKhalifa").collection("booking");
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        // console.log(result);
        res.send(result.insertedCount > 0);
      })
    console.log(newBooking);
  })

  // READ
  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          console.log(decodedToken);
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            //FInd booking data for specific email 
            bookings.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.send(documents);
              })

          }

        })

    }


    // idToken comes from the client app


  })
});




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})