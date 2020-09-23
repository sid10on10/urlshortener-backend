var express = require('express');
var router = express.Router();
var {url,mongodClient} = require("../config")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongodb = require("mongodb")
const {authenticate} = require('../common/auth');

router.get('/',async function(req,res,){
    res.write("<h1>Don't do it You are going nowhere</h1>")
    res.end()
})

router.get('/data',authenticate,async function(req,res,){
    let client;
    try{
        client = await mongodClient.connect(url)
        let db = client.db("shortener")
        let token = req.headers.authorization
        let user = jwt.verify(token,"abcdefghijklmnopqrs")
        let userID = user.id
        let userData = await db.collection("users").findOne({_id:mongodb.ObjectId(userID)})
        if(userData){
            let urls = userData.urls
            let Outdata = []
            if(urls!=undefined){
                for(each of urls){
                    if(each){
                        let eachURL = await db.collection("urls").findOne({short:each})
                        let longURL = eachURL.longURL
                        let shortURL = eachURL.shortURL
                        let count = eachURL.count
                        Outdata.push({
                            longURL,shortURL,count
                        })
                    }else{
                        // pass
                    }
                }
            }else{
                res.json({
                    Outdata
                })
            }
            res.json({
                message:"User Urls Data",
                Outdata
            })
        }
    }catch(error){
        client.close()
        console.log(error)
    }
  })



module.exports = router;
