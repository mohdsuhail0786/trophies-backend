require('dotenv').config({path: '../.env'});
const globalConstant=require('../utils/globalConstant');
const apiUtils=require('../utils/apiUtils');
const logger = require('../utils/logger');
const HttpStatus=require('http-status-codes');

const verifyUser=(req,res,next)=>{
    logger.debug('inside verifyUser middleware');
    let token;
    if(req.params.token){
        token=req.params.token;
    }
    else{
        token=req.headers[globalConstant.TOKEN];;
    }
    if(token){
        apiUtils.verifyAccessToken(token,process.env.TOKEN_SECRET)
        .then((user)=>{
            req.user=user;
            next();
        })
        .catch((err)=>{
            logger.debug('token is unauthentic');
            res.status(400).json(apiUtils.getResponseMessage(400,'token is unauthentic'));
        })
    }
    else{
        logger.debug('no token found');
        res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(400,'token not found'));
    }
}

module.exports=verifyUser;
