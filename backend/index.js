const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

//mongodb+srv://shreyas:<password>@cluster0.ealgmik.mongodb.net/

mongoose.connect(
  "mongodb+srv://tester:shreyas@cluster0.ealgmik.mongodb.net/e-commerce"
);

app.get("/", (req, res) => {
  res.send("Express app is running");
});
//Schema for creatings products
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
});
app.post('/addproduct',async(req,res)=>{
    const product = new Product({
        id:req.body.id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
        
    });
    console.log(product);
    await product.save();
    console.log("Successfully added product");
    res.json({
        success:true,
        name:req.body.name,
    })
})
app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on port", +port);
  } else {
    console.log("Error" + error);
  }
});
