const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { log } = require("console");

app.use(express.json());
app.use(cors());

//mongodb+srv://shreyas:<password>@cluster0.ealgmik.mongodb.net/

mongoose.connect("mongodb+srv://shashank:Sha%401234@cluster0.yun9tjv.mongodb.net/e-commerce"

);

app.get("/", (req, res) => {
  res.send("Express app is running");
});
//Image Storage Engine 
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
      console.log(file);
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage: storage})
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:4000/images/${req.file.filename}`
    })
})
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

//Add products end points
app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product= last_product_array[0];
        id = last_product.id + 1;
    }
    else{
        id = 1;
    }
    const product = new Product({
        id:id,
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
//Remove a specific product
app.post("/removeproduct", async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name });
});
//Get all products end-point
app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("All fetched")
    res.send(products);
})

//Schema creating for User model
const Users1=mongoose.model('Users1',{
  name:{
    type:String,
  },
  email:{
    type:String,
    unique:true,
  },
  password:{
    type:String
  },
  cartData:
  {
    type:Object,
  },
  date:{
    type:Date,
    default:Date.now,
  }
})

//Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  console.log("Login");
    let success = false;
    let user = await Users1.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
			success = true;
      console.log(user.id);
			const token = jwt.sign(data, 'secret_ecom');
			res.json({ success, token });
        }
        else {
            return res.status(400).json({success: success, errors: "please try with correct email/password"})
        }
    }
    else {
        return res.status(400).json({success: success, errors: "please try with correct email/password"})
    }
})

//Create an endpoint at ip/auth for regestring the user in data base & sending token
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
        let success = false;
        let check = await Users1.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: success, errors: "existing user found with this email" });
        }
        let cart = {};
          for (let i = 0; i < 300; i++) {
          cart[i] = 0;
        }
        const user = new Users1({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });
        await user.save();
        const data = {
            user: {
                id: user.id
            }
        }
        
        const token = jwt.sign(data, 'secret_ecom');
        success = true; 
        res.json({ success, token })
    })

//Endpoint for new collections
app.get('/newcollections',async(req,res)=>{
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("New collection fetched");
  res.send(newcollection);
})
//Endpoint for popular in women
app.get('/popularinwomen' , async(req,res)=>{
  let products = await Product.find({category:"women"});
  let popular_in_women = products.slice(0,4);
  console.log("Popular in women fetch done");
  res.send(popular_in_women);
})

//Creating middle ware to fetch the user
const fetchUser = async(req,res,next)=>{
  const token = req.header('auth-token');
  if (!token){
    res.status(401).send({errors:"Please authenticate using valid token"})
  }
  else{
    try{
      const data = jwt.verify(token ,'secret_ecom');
      req.user = data.user;
      next();
    }catch(error){
      res.status(401).send({errros:"Please authenticate using a valid token"})
    }
  }

}
//Creating endpoint for adding products in Cart
app.post('/addtocart',fetchUser,async(req,res)=>{
  let userData = await Users1.findOne({_id:req.user.id});
  userData.cartData[req.body.itemId] += 1;
  await Users1.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
  res.send("Added")
})
//Creating endpoint to remove item from cart
app.post("/removefromcart", fetchUser, async (req, res) => {
  let userData = await Users1.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 1)
    userData.cartData[req.body.itemId] -= 1;
  await Users1.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Removed");
});

//Creating end point to get the cart data when logged in
app.post('/getcart',fetchUser,async(req,res)=>{
  let userData = await Users1.findOne({_id:req.user.id});
  res.json(userData.cartData);
})
app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on port", +port);
  } else {
    console.log("Error" + error);
  }
});
