require('dotenv').config({path: '../.env'});
const express=require('express');
const router=express.Router();
const apiUtils=require('../utils/apiUtils');
const User=require('../models/userSchema');
const bcrypt=require('bcrypt');
const HttpStatus=require('http-status-codes');
const globalConstant=require('../utils/globalConstant');
const logger = require('../utils/logger');
const verifyUser = require('../middlewares/verifyUser');
const {Auth} = require('two-step-auth');
const emailcheck=require('email-check');
const legit=require('legit');

router.use(express.json());

router.post('/signin',(req,res)=>{
    logger.debug('inside signin api');
    User.findOne({email:req.body.email},(err,result)=>{
        if(err){
            res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,err))
        }
        else if(result==null){
            logger.debug('user not exists');
            res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,'user not registered, Please register first'));
        }
        else if(result.password){
            logger.debug('user found,checking password....');
            bcrypt.compare(req.body.password,result.password)
            .then((isValidUser)=>{
                if(isValidUser){
                    logger.debug('correct password');
                    const payload={
                        firstName:result.firstName,
                        lastName:result.lastName,
                        email:result.email,
                        role:result.role,
                        id:result._id
                    }
                    logger.debug('generating token...');
                    const token=apiUtils.generateAccessToken(payload,process.env.TOKEN_SECRET);
                    const resp=apiUtils.getResponseMessage(200,'logged in successfully');
                    resp['access-token']=token;
                    logger.debug('token generated successfully');
                    res.status(HttpStatus.OK).json(resp);
                }
                else{
                    logger.debug('incorrect password');
                    res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,'incorrect password'));
                }
            })
            .catch((err)=>{
                logger.debug('Error occured');
                res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,err.message));
            })
        }
        else{
            res.status(400).json(apiUtils.getResponseMessage(400,'Please set password before general login'));
        }
    })
});

router.post('/signup',(req,res)=>{
    logger.debug('inside signup api');
    if(req.body.role=='admin'|| req.body.role=='user'){
        User.findOne({email:req.body.email},(err,result)=>{
            if(err){
                res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,err));
            }
            else if(result!=null){
                logger.debug('user already exists');
                res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,'User with this e-mail id already existed'));
            }
            else{
                logger.debug('creating new user')
                const obj={
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    email:req.body.email,
                    role:req.body.role,
                }
                bcrypt.hash(req.body.password,globalConstant.SALT_ROUNDS)
                .then((hashedPass)=>{
                    obj.password=hashedPass;
                    return User.create(obj);
                })
                .then((user)=>{
                    res.status(HttpStatus.OK).json(apiUtils.getResponseMessage(200,'User successfully created'));
                })
                .catch((err)=>{
                    res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,err.message));
                })
            }
        })
    }
    else{
        logger.debug('role is undefined')
        res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,'role is undefined'));
    }
});

router.put('/resetPassword/:token',verifyUser,(req,res)=>{
    logger.debug('inside resetPassword');
    const pass=req.body.password;
    const user=req.user;
    bcrypt.hash(pass,globalConstant.SALT_ROUNDS)
    .then((hashed)=>{
        return User.findOneAndUpdate({email:user.email},{password:hashed},{new:true,useFindAndModify:false});
    })
    .then((result)=>{
        logger.debug('Password changed successfully');
        res.status(HttpStatus.OK).json(apiUtils.getResponseMessage(200,'Password Reset successfull'));
    })
    .catch((err)=>{
        logger.debug("Error Occured");
        res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,err));
    })
})

router.put('/forgotPassword',(req,res)=>{
    logger.debug('inside forgot API')
    const email=req.body.email;
    User.findOne({email:email})
    .then((result)=>{
        if(result){
            logger.debug('user found')
            const obj={
                id:result['_id'],
                firstName:result.firstName,
                email:result.email,
                role:result.role,
            }
            const token=apiUtils.generateAccessToken(obj,process.env.TOKEN_SECRET);
            apiUtils.sendmail(email,token)
            .then((resp)=>{
                if(resp){
                    logger.debug(JSON.stringify(resp));
                    logger.debug('mail sent')
                    res.status(HttpStatus.OK).json(apiUtils.getResponseMessage(HttpStatus.OK,`mail sent to ${email}`));
                }
                else{
                    logger.debug('mail not exist')
                    return Promise.reject('mail is incorrect');
                }
            })
            .catch((err)=>{
                return Promise.reject(err);
            })
        }
        else{
            logger.debug('user not found')
            return Promise.reject('user not exist');
        }
    })
    .catch((err)=>{
        logger.debug('Error Occured :: '+err);
        res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(HttpStatus.BAD_REQUEST,err));
    })
    
})

module.exports=router;