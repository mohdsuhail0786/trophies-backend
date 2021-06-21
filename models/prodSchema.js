const mongoose=require('mongoose');


const productSchema=mongoose.Schema({
    modelNumber:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    imageName:{
        type:String,
        required:true
    }
});


module.exports=mongoose.model('trophieInfo',productSchema);