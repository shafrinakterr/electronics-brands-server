const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

// mongodb code

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m4lqpwk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db('electronicsDB').collection('electronics')
    const BrandCollection = client.db('electronicsDB').collection('brands')
    const cart = client.db("electronicsDB").collection("cart");
    // Send a ping to confirm a successful connection


    // get id 
    app.get('/product/:name', async (req, res) => {
      const name = req.params.name;
      const query = { brand_name: name };
      const result = await productCollection.find(query).toArray();
      res.send(result)
    })



    // create
    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      console.log(newProduct)
      res.send(result)
    })
    // read
    app.get('/product', async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query)
      res.send(result)
    })

    // brand 
    app.get('/brand', async (req, res) => {
      const cursor = BrandCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // product updated
    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateProduct = req.body;
      const product = {
        $set: {
          brand_name: updateProduct.brand_name,
          name: updateProduct.name,
          photo: updateProduct.photo,
          rating: updateProduct.rating,
          category: updateProduct.category,
          price: updateProduct.price,
          description: updateProduct.description
        }
      }
      const result = await productCollection.updateOne(cursor, product, options)
      res.send(result)
      console.log(updateProduct);

    })


    // cart 

    app.post('/cart', async (req, res) => {
      const item = req.body;
      delete item._id
      const result = await cart.insertOne(item);
      res.send(result);
    })

    app.get("/cart", async (req, res) => {
      const result = await cart.find().toArray();
      res.send(result);
    })
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cart.deleteOne(query);
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('server is runing');
})
app.listen(port, () => {
  console.log(`server is runnig on port :${port}`)
})
