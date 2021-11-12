const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');

const app = express()
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 7000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w5gtl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const run = async() => {

    try{
        await client.connect();
        const database = client.db("travellBD");
        const cardCollection = database.collection("cards");
        const usersCollection = database.collection("users");
        const reviewCollection = database.collection("review");
        console.log('connected')

        app.get('/cards', async(req,res)=>{
            const cursor = cardCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/cards', async(req,res)=>{
            const newEvent = req.body
            const result = await cardCollection.insertOne(newEvent)
            res.json(result)
        })

        app.delete('/cards/:id', async(req,res)=>{
            const id = req.params.id
            const cursor = {_id : ObjectId(id)}
            const result = await cardCollection.deleteOne(cursor)
            res.json(result)
          })

        app.post('/users', async(req,res)=>{
            const newPlan = req.body
            const result = await usersCollection.insertOne(newPlan)
            res.json(result)
        })

        app.get('/users', async(req,res)=>{
            const cursor = usersCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        app.delete('/users/:id', async(req,res)=>{
            const id = req.params.id
            const cursor = {_id : ObjectId(id)}
            const result = await usersCollection.deleteOne(cursor)
            res.json(result)
          })

        app.put('/users/:id', async(req,res)=>{
            const id = req.params.id;
            const status = req.body.status;
            // const filter = {email: user.email};
            const filter = {_id :ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  status: status
                },
              };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        });
//make admin
        app.put('/users/', async(req, res) => {
            const user = req.body;
            console.log('put', user);
             const filter = {email: user.email};
           const updateDoc = { $set: {role: 'administrator'}};
            const result = await usersCollection.updateOne(filter, updateDoc) ;
            res.json(result)
        })

        app.get('/users/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email}
            const user = await usersCollection.findOne(query);
            let isAdministrator = false;
            if(user?.role === 'administrator') {
                isAdministrator = true;
            }
            res.json({administrator: isAdministrator})
        })

        // review
        app.post("/review", async (req, res) => {
          const result = await reviewCollection.insertOne(req.body);
          res.json(result);
        });
        app.get("/review", async (req, res) => {
          const result = await reviewCollection.find({}).toArray();
          console.log(result)
          res.send(result);
        });
  // app.post("/addUserInfo", async (req, res) => {
  //   console.log("req.body");
  //   const result = await usersCollection.insertOne(req.body);
  //   res.send(result);
  //   console.log(result);
  // });

    }
    finally{

    }
}
run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('CAR HOUSE SERVER IS RUNNING')
})

app.listen(port,()=>{
    console.log('running server on',port)
})