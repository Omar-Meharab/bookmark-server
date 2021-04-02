const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9zre.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 5000

app.get('/', (req, res) =>{
    res.send("hello world")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const booksCollection = client.db("bookMark").collection("books");
  const ordersCollection = client.db("bookMark").collection("orders");
  
    // app.post('/addBooks', (req, res) =>{
    //   const books = req.body;
    //   booksCollection.insertMany(books)
    //   .then(result => {
    //     console.log(result.insertedCount);
    //     res.send(result.insertedCount)
    //   })
    // })

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
      const id = ObjectId(req.params.id);
      console.log('delete this', id);
    })

});


app.listen(port)