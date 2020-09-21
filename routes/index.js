var express = require('express');
var router = express.Router();
var mongodb = require("mongodb")
var {url,mongodClient} = require("../config")
const {sendMail} = require('../common/mailer');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/forgot_password', async function(req, res, next) {
  let client;
  try{
    client = await mongodClient.connect(url)
    let db = client.db("shortener")
    let user = await db.collection("users").findOne({email:req.body.email})
    let userId = user._id
    if(user){
      let reset_string = Math.random().toString(36).substr(2, 5);
      await db.collection("users").findOneAndUpdate({email:req.body.email},{$set:{reset_token:reset_string}})
      let reset_url  = `http://localhost:3000/reset/${userId}/${reset_string}`
      let mail = sendMail(email, 'Password Reset', reset_url);
      if(!mail) throw "mail not send";
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
      await db.collection("users").findOneAndUpdate({activationKey:req.params.activationKey},{$set:{activated:true,activationKey:""}})
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




module.exports = router;
