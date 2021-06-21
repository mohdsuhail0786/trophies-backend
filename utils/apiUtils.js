require('dotenv').config();
const jwt=require('jsonwebtoken');
const nodemailer=require('nodemailer');
const logger=require('./logger');

exports.getResponseMessage=(statusCode,msg)=>{
    return {
        statusCode,
        message:msg
    }
}

exports.generateAccessToken=(payload,token_secret)=>{
    return jwt.sign(payload,token_secret,{expiresIn:'3600s'});
}

exports.verifyAccessToken=(token,token_secret)=>{
    return new Promise((resolve,reject)=>{
        jwt.verify(token,token_secret,(err,decoded)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(decoded);
            }
        })
    })
}

//MAILING service
const gmail=nodemailer.createTransport({
    service: 'Gmail',
    auth:{
        user: process.env.MAIL,
        pass: process.env.PASSWD
    }
})
exports.sendmail=(mail,token)=>{
    logger.debug(`sending mail to ${mail}`);
    return new Promise((resolve,reject)=>{
        gmail.sendMail({
            from: `"TrophieZila" ${process.env.MAIL}`,
            to: mail,
            subject: 'Forgot Password',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account on TrophieZila.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://localhost:4000/trophies/developer/api-docs/#/default/put_resetPassword__token_/'+ token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        },(err,result)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(result)
            }
        })
    })
}