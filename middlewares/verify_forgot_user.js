require('dotenv').config({path: '../.env'});
const globalConstant=require('../utils/globalConstant');
const apiUtils=require('../utils/apiUtils');
const logger = require('../utils/logger');
const HttpStatus=require('http-status-codes');
const User=require('../models/userSchema')

const verifyForgotUser=(req,res,next)=>{
    logger.debug('inside verifyForgotUser middleware');
    const token=req.headers[globalConstant.TOKEN];
    if(token){
        apiUtils.verifyAccessToken(token,process.env.FORGOT_TOKEN_SECRET)
        .then((user)=>{
            return User.findById(user.id)
        })
        .then((originalUser)=>{
            req.user=originalUser;
            next();
        })
        .catch((err)=>{
            logger.debug('token is unauthentic :: '+err);
            res.status(HttpStatus.UNAUTHORIZED).json(apiUtils.getResponseMessage(HttpStatus.UNAUTHORIZED,'token is unauthentic'));
        })
    }
    else{
        logger.debug('no token found');
        res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(HttpStatus.BAD_REQUEST,'token not found'));
    }
}

module.exports=verifyForgotUser;