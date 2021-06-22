require('dotenv').config({path: '../.env'});
const globalConstant=require('../utils/globalConstant');
const apiUtils=require('../utils/apiUtils');
const logger = require('../utils/logger');
const HttpStatus=require('http-status-codes');
const User=require('../models/userSchema')

const verifyUser=(req,res,next)=>{
    logger.debug('inside verifyUser middleware');
    const token=req.headers[globalConstant.TOKEN];
    if(token){
        logger.debug('token detected');
        apiUtils.verifyAccessToken(token,process.env.TOKEN_SECRET)
        .then((user)=>{
            logger.debug('token verified')
            return User.findById(user.id)
        })
        .then((originalUser)=>{
            logger.debug('user found in db')
            req.user=originalUser;
            next();
        })
        .catch((err)=>{
            logger.debug('token is unauthentic :: '+err);
            res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(HttpStatus.BAD_REQUEST,'token is unauthentic'));
        })
    }
    else{
        logger.debug('no token found');
        res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,'token not found'));
    }
}


module.exports=verifyUser;

