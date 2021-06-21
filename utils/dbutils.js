require('dotenv').config({path: '../.env'});
const mongoose=require('mongoose');
const uri=process.env.URI;

function connect(){
    mongoose.connect(uri,{useUnifiedTopology:true,useNewUrlParser: true})
        .then(()=> console.log("connected to mongoDB"))
        .catch((err)=> console.log(err.message));
}


function close(){
    mongoose.disconnect();
}

module.exports={connect,close};