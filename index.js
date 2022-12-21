const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.v8gjvac.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        const usersCollection = client.db('PowPowDB').collection('users');
        const foodsCollection = client.db('PowPowDB').collection('foods');
        const reviewsCollection = client.db('PowPowDB').collection('reviews');
        const bookedCollection = client.db('PowPowDB').collection('booked');

        // set user in DB 
        app.post('/users', async (req, res) => {
            const query = req.body;
            const cursor = await usersCollection.insertOne(query)
            res.send(cursor)
        })

        // set Food In DB 
        app.post('/foods', async (req, res) => {
            const query = req.body;
            const cursor = await foodsCollection.insertOne(query)
            res.send(cursor)
        })

        // get food from DB 
        app.get('/foods', async (req, res) => {
            // console.log('hi');
            const category = req.query.category;
            const query = {
                $and: [{ category: category }, { status: 'available' }]
            }
            const foods = await foodsCollection.find(query).toArray();
            res.send(foods)
        })


        // get single food informarion 
        app.get('/food', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) }
            const food = await foodsCollection.findOne(query);
            res.send(food)
        })

        // set review to DB 
        app.post('/reviews', async (req, res) => {
            const query = req.body;
            const cursor = await reviewsCollection.insertOne(query)
            res.send(cursor)
        })

        // get review 
        app.get('/reviews', async (req, res) => {
            const id = req.query.id;
            const query = { foodId: id };
            const result = await reviewsCollection.find(query).sort({ $natural: -1 }).toArray()
            res.send(result)
        })

       



        // set purchase
        app.post('/booked', async (req, res) => {
            const id = req.query.id;
            const filter = { _id: ObjectId(id) }
            
            const buyinfo = req.body;
            const purchaseQuery = { foodId: buyinfo.foodId }
            console.log(purchaseQuery);
            
            const purchaseFood = await bookedCollection.findOne(purchaseQuery)

            
            
            if (purchaseFood) {
                const updateCollection = {
                    $set: {
                        itemsNumber: purchaseFood.itemsNumber + 1
                    }
                }
                
                const updatedCollection = await bookedCollection.updateOne(purchaseQuery, updateCollection);
                res.send(updatedCollection)
            }
            
            else {
                const purchased = await bookedCollection.insertOne(buyinfo)
                res.send(purchased)
            }
            
            
            
            // const cursor = await foodsCollection.findOne(filter)
            
            // if (cursor.quantity > 1) {
            //     const updateDoc = {
            //         $set: {
            //             quantity: cursor.quantity - 1
            //         }
            //     }
            //     const updatedResult = await foodsCollection.updateOne(filter, updateDoc);
            //     res.send(updatedResult)
            // }
            // else {
            //     const updateSold = {
            //         $set: {
            //             status: 'unavailable'
            //         }
            //     }
            //     const updatedResult = await foodsCollection.updateOne(filter, updateSold);
            //     res.send(updatedResult)
            // }


        })


        //get booked food collection
        app.get('/booked', async(req, res) => {
            const email = req.query.email;
            const query = { customerEmail: email }
            const cursor = await bookedCollection.find(query).toArray();
            res.send(cursor)
        })

        app.delete('/delete-food', async(req, res)=>{
            const id = req.query.id;
            const query = { _id: ObjectId(id) }
            // console.log(query);
            const result = await bookedCollection.deleteOne(query);
            res.send(result)
        })



    }
    finally {

    }
}


run().catch(err => console.error(err))




app.get('/', (req, res) => {
    res.send('Pow Pow server is running');
})
app.listen(port, () => {
    console.log(`Running on port ${port}`);
})
