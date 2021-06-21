const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String
    },
    role:{
        type:String,
        required:true
    },
    is_verified:{
        type:Boolean,
        default:false
    }
});

module.exports=mongoose.model('Users',userSchema);