var express = require('express');
var router = express.Router();
var {url,mongodClient} = require("../config")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {authenticate} = require('../common/auth');

router.get('/',authenticate,async function(req,res,){
    res.write("<h1>Hello World</h1>")
    res.end()
})

router.post('/', async function(req, res, next) {
    let client;
    try{
        client = await mongodClient.connect(url)
        let db = client.db("shortener")
        
        
    }catch(error){
        client.close()
        console.log(error)
    }
});

module.exports = router;
