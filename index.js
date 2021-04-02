const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9zre.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());



var serviceAccount = require("./bookmark-7dff4-firebase-adminsdk-ubmky-58f30eff87.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const port = process.env.PORT || 5000

app.get('/', (req, res) =>{
    res.send("hello world")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const booksCollection = client.db("bookMark").collection("books");
  const ordersCollection = client.db("bookMark").collection("orders");
  
    app.get('/books', (req, res) =>{
      booksCollection.find({})
      .toArray( (err, documents) => {
        res.send(documents);
      })
    })

    app.get('/book/:id', (req, res) => {
      booksCollection.find({_id: ObjectId(req.params.id)})
      .toArray( (err, documents) =>{
        res.send(documents[0]);
      })
    })
    
    app.post('/addBooks', (req, res) =>{
      const book = req.body;
      booksCollection.insertOne(book)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
    })

    app.post('/addOrder', (req, res) => {
      const newOrder = req.body;
      ordersCollection.insertOne(newOrder)
          .then(result => {
              res.send(result.insertedCount > 0);
          })
  })

    app.delete('/deleteBook/:id', (req, res) => {
      booksCollection.deleteOne({_id: ObjectId(req.params.id)})
      .then(result => {
        res.send(result.deletedCount > 0);
      })
    })

    app.get('/orders', (req, res) => {
      const bearer = req.headers.authorization;
      if (bearer && bearer.startsWith('Bearer ')) {
          const idToken = bearer.split(' ')[1];
          // idToken comes from the client app
          admin.auth().verifyIdToken(idToken)
              .then((decodedToken) => {
                  const tokenEmail = decodedToken.email;
                  const queryEmail = req.query.email;
                  if (tokenEmail == queryEmail) {
                      ordersCollection.find({ email: queryEmail })
                          .toArray((err, documents) => {
                              res.status(200).send(documents);
                          })
                  }
                  else {
                      res.status(401).send('unauthorized access')
                  }
              })
              .catch((error) => {
                  res.status(401).send('unauthorized access');
              });
      }
      else {
          res.status(401).send('unauthorized access');
      }
  })

});


app.listen(port)