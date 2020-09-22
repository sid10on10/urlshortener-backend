var express = require('express');
var router = express.Router();
var {url,mongodClient} = require("../config")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongodb = require("mongodb")
const {authenticate} = require('../common/auth');

router.get('/:shorturl',async function(req,res,){
  let client;
  try{
      client = await mongodClient.connect(url)
      let db = client.db("shortener")
      let short = req.params.shorturl
      let data = await db.collection("urls").findOne({short})
      let longurl = data.longURL
      await db.collection("urls").findOneAndUpdate({short},{$inc:{count:1}})
      res.redirect(longurl)
  }catch(error){
      client.close()
      console.log(error)
  }
})



module.exports = router;
