var express = require('express');
var router = express.Router();
var {url,mongodClient} = require("../config")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongodb = require("mongodb")
const {authenticate} = require('../common/auth');

router.get('/',authenticate,async function(req,res,){
    res.write("<h1>Hello World</h1>")
    res.end()
})

module.exports = router;
