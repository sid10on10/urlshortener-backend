var express = require('express');
var router = express.Router();
var mongodb = require("mongodb")
var {url,mongodClient} = require("../config")
var nodemailer = require("nodemailer")

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sid10on10@gmail.com',
    pass: '#password'
  }
});

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
      var mailOptions = {
        from: 'account@gmail.com',
        to: req.body.email,
        subject: 'Password reset',
        text: `Reset Your Password Here ${reset_url}`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          res.json({
            message:"Email Sent"
          })
        }
      });
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




module.exports = router;
