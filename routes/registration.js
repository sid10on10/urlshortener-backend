var express = require('express');
var router = express.Router();
var {url,mongodClient} = require("../config")
const bcryptjs = require("bcryptjs")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.write("<h1>Registration page! Use POST method to register Users</h1>");
  res.end()
});

router.post('/', async function(req, res, next) {
  let client;
  try{
    client = await mongodClient.connect(url)
    let db = client.db("shortener")
    let salt = await bcryptjs.genSalt(10)
    let hash = await bcryptjs.hash(req.body.password,salt)
    req.body.password = hash
    await db.collection("users").insertOne(req.body)
    client.close()
    res.json({
        message:"Registration Successful"
    })
    //console.log(req.body)
    res.end()
  }catch(error){
    client.close()
    console.log(error)
  }
  });

module.exports = router;
