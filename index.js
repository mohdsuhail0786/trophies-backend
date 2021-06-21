require('dotenv').config();
const port=process.env.PORT||3000;
const {connect:mongoConnect,close:mongoClose}=require('./utils/dbutils');
const trophiesRoutes=require('./routes/trophies');
const adminRoutes=require('./routes/Users');
const socialLoginRoutes=require('./routes/oauth');
const express=require('express');
const bodyParser=require('body-parser');
const baseurl=process.env.BASE_URL;
const swaggerRoute=require('./swagger/swagger');
const cors=require('cors');
//const crypto=require('crypto');


const app=express();

app.use(cors());
app.use(express.json());
app.use('/trophies',[trophiesRoutes,adminRoutes,socialLoginRoutes]);
app.use('/trophies/developer',swaggerRoute);

 

app.listen(port,()=>{
    //console.log(crypto.randomBytes(100).toString('base64'));
    console.log(`Listening on:  ${baseurl}/trophies`);
    mongoConnect();
})