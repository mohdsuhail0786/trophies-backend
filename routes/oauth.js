require('dotenv').config({path:'../.env'});
const fetch=require('node-fetch')
const express=require('express');
const router=express.Router();
const globalConstant=require('../utils/globalConstant');
const logger=require('../utils/logger');
const apiUtils=require('../utils/apiUtils');
const {OAuth2Client}=require('google-auth-library');
const HttpStatus=require('http-status-codes');
const User=require('../models/userSchema');

router.post('/socialLogin',(req,res)=>{
    const code=req.headers[globalConstant.CODE];
    const role=req.body.role;
    if(code){
        logger.debug('code received, preparing to fetch...');
        const body={
            'client_id':process.env.GOOGLE_CLIENT_ID,
            'client_secret':process.env.GOOGLE_CLIENT_SECRET,
            'grant_type':'authorization_code',
            'code':code,
            'redirect_uri':'http://localhost:4000/trophies/'
        }
        let userData;
        fetch('https://oauth2.googleapis.com/token',{
            method:'POST',
            headers:{
                'content_type':'application/x-www-form-urlencoded',
                'Accept':'*/*'
            },
            body:JSON.stringify(body)
        })
        .then((response)=>{
            if(response.ok){
                logger.debug('request successfull');
                return response.json();
            }
        })
        .then((result)=>{
            return fetchRequiredDataFromGoogle(process.env.GOOGLE_CLIENT_ID,result['id_token']);
        })
        .then((user)=>{
            userData=user;
            return User.findOne({email:user.email});
        })
        .then((dbuser)=>{
            if(dbuser){
                logger.debug('user already exists');
                return Promise.resolve();
            }
            else{
                if(role=='admin'||role=='user'){
                    userData.role=role;
                    return User.create(userData);
                }
                else{
                    return Promise.reject('role is undefined');
                }
            }
        })
        .then((response)=>{
            logger.debug('generating access token');
            return apiUtils.generateAccessToken(userData,process.env.TOKEN_SECRET);
        })
        .then((token)=>{
            const resp=apiUtils.getResponseMessage(200,'User logged in successfully');
            resp[globalConstant.TOKEN]=token;
            res.status(HttpStatus.OK).json(resp);
        })
        .catch((err)=>{
            logger.debug('error occured');
            res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,err));
        })
    }
    else{
        logger.debug('code not received, Please provide code');
        res.status(400).json(apiUtils.getResponseMessage(400,'please provide google access code'));
    }
})


const fetchRequiredDataFromGoogle=(clientId,idToken)=>{
    logger.debug('fetching data of user from google');
    const client=new OAuth2Client(clientId);
    return new Promise((resolve,reject)=>{
        client.verifyIdToken({
            idToken
        })
        .then((response)=>{
            const user={
                firstName:response.payload.given_name,
                lastName:response.payload.family_name,
                email:response.payload.email,
                is_verified:response.payload.email_verified
            }
            resolve(user);
        })
        .catch((err)=>{
            reject(err);
        })
    })
}

module.exports=router;