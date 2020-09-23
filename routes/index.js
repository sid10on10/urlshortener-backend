var express = require('express');
var router = express.Router();
var mongodb = require("mongodb")
var {url,mongodClient} = require("../config")
const { sendEmail } = require('../common/mailer');
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken")
const {authenticate} = require('../common/auth');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/shorturl',authenticate, async function(req, res, next) {
  let client;
  try{
      client = await mongodClient.connect(url)
      let db = client.db("shortener")
      let token = req.headers.authorization
      let user = jwt.verify(token,"abcdefghijklmnopqrs")
      let userID = user.id
      //console.log(user)
      //console.log(token)
      let short = Math.random().toString(20).substr(2, 6);
      let shortURL = `https://urlshortener-zen.herokuapp.com/short/${short}`
      let longURL = req.body.url
      await db.collection("urls").insertOne({
          short,shortURL,longURL,count:0,
      })
      await db.collection("users").findOneAndUpdate({_id:mongodb.ObjectId(userID)},{$push:{urls:short}})
      res.json({
          message:"Short url Created",
          shorturl:shortURL
      })
  }catch(error){
      client.close()
      console.log(error)
  }
});

module.exports = router;

router.post('/forgot_password', async function(req, res, next) {
  let client;
  try{
    client = await mongodClient.connect(url)
    let db = client.db("shortener")
    let user = await db.collection("users").findOne({email:req.body.email})
    if(user){
      let userId = user._id
      let email = req.body.email
      let reset_string = Math.random().toString(36).substr(2, 5);
      await db.collection("users").findOneAndUpdate({email:req.body.email},{$set:{reset_token:reset_string}})
      let reset_url  = `https://urlshortener-zen.herokuapp.com/reset/${userId}/${reset_string}`
      let mail_data = `Click here to reset your password ${reset_url}`
      let mail = await sendEmail(email, 'Password Reset Link', mail_data);
      console.log(mail)
      res.json({
        message:"Email Sent"
      })
    }else{
      res.status(404).json({
        message:"No user exist with this email."
      })
      client.close()
      res.end()
    }
  }catch(error){
    client.close()
    console.log(error)
  }
});

router.get('/reset/:userid/:reset_string', async function(req, res, next) {
  let client;
  try{
    client = await mongodClient.connect(url)
    let db = client.db("shortener")
    let user = await db.collection("users").findOne({_id:mongodb.ObjectId(req.params.userid)})
    if(user){
      let userEmail = user.email
      if(user.reset_token==req.params.reset_string){
        //res.write("<h1>You can Reset</h1>")
        res.render('reset',{email:userEmail})
        res.end()
        client.close()
      }else{
        client.close()
        res.status(404).json({
          message:"Invalid URL"
        })
      }
    }else{
      client.close()
      res.status(404).json({
        message:"Invalid URL"
      })
    }
    
    }catch(error){
      client.close()
      console.log(error)
  }
});

router.get('/activate/:activationKey', async function(req, res, next) {
  let client;
  try{
    client = await mongodClient.connect(url)
    let db = client.db("shortener")
    let user = await db.collection("users").findOne({activationKey:req.params.activationKey})
    if(user){
      await db.collection("users").findOneAndUpdate({activationKey:req.params.activationKey},{$set:{activated:true}})
      await db.collection("users").updateOne({activationKey:req.params.activationKey},{$unset:{activationKey:1}})
      res.json({
        message:"Successfully Activated You can login"
      })
    }else{
      client.close()
      res.status(404).json({
        message:"Invalid URL"
      })
    }
    
    }catch(error){
      client.close()
      console.log(error)
  }
});

router.post('/reset_password', async function(req, res, next) {
  let client;
  try{
    client = await mongodClient.connect(url)
    let db = client.db("shortener")
    let {email,password} = req.body
    let user = await db.collection("users").findOne({email:email})
    let salt = await bcryptjs.genSalt(10)
    let hash = await bcryptjs.hash(password,salt)
    password = hash
    let setpass = await db.collection("users").updateOne({email},{$set:{password}})
    let remove_token = await db.collection("users").updateOne({email},{$unset:{reset_token:1}})
    res.json({
      message:"Password reset complete"
    })
  }catch(error){
    client.close()
    console.log(error)
  }
});



module.exports = router;
