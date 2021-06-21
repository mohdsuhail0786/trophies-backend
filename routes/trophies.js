const express=require('express');
const router=express.Router();
const productSchema=require('../models/prodSchema');
const bodyParser=require('body-parser');
const multer=require('multer');
const {upload} = require('../middlewares/storage');
const logger=require('../utils/logger');
const HttpStatus=require('http-status-codes');
const verifyUser=require('../middlewares/verifyUser');
const apiUtils=require('../utils/apiUtils');

router.use(bodyParser.json());

router.use(express.static(__dirname+"./public"));

//RETURN ALL THE PRODUCTS IN THE DB
router.get('/',(req,res)=>{
    logger.debug('inside get api');
    productSchema.find({})
    .then((result)=>{
        res.status(HttpStatus.OK).json({result});
    })
    .catch((err)=>{
        logger.error(`error occured ${err.message}`);
        res.status(HttpStatus.NOT_FOUND).json({message:err.message});
    })
});


//THIS WILL ADD A NEW PRODUCT TO THE DB
router.post('/add',upload.single('image'),verifyUser,(req,res)=>{
    logger.debug('inside add api')
    if(req.user.role=='admin'){
        productSchema.findOne({modelNumber:req.body.modelNumber},function(err,result){
            if(err){res.json(err)}
            if(result===null){
                logger.debug('product not found, creating a new One');
                const trophie={
                    modelNumber:req.body.modelNumber,
                    name:req.body.name,
                    price:parseInt(req.body.price),
                    discount:parseInt(req.body.discount),
                    description:req.body.description,
                    imageName:req.file.filename
                    };
                    let newTrophie=new productSchema(trophie);
                    newTrophie.save()
                    .then(()=>{
                        logger.debug('successfully inserted product into db');
                        res.status(HttpStatus.OK).json({message:"Successfully inserted"});
                    })
                    .catch((err)=>{
                        logger.error(`error occured ${err.message}`);
                        res.status(HttpStatus.BAD_REQUEST).json({message:err.message});
                    });
            }
            else{
                res.status(HttpStatus.CONFLICT).json({message:"user already exist, cannot create a user with this model number"});
            }
        })
    }
    else{
        logger.debug('access-denied');
        res.status(400).json(apiUtils.getResponseMessage(400,'you are not authorized to perform this action'));
    }
});

//USED TO UPDATE THE INFO OF A PRODUCT
router.put('/update',upload.single('image'),verifyUser,(req,res)=>{
    logger.debug('inside update api');
    if(req.user.role=='admin'){
        productSchema.findOne({modelNumber:req.body.modelNumber},function(err,result){
            if(err){res.json(err);}
            if(result===null)
            {
                logger.debug('not find the product with given model no.');
                res.status(HttpStatus.NOT_FOUND).json({message:"product with given model no. not exist"});
            }
            else{
                logger.debug('product found, Updating...');
                var obj=req.body;
                if(req.file){
                    obj.imageName=req.file.filename;
                }
                productSchema.updateOne(result,obj,function(err,result){
                    if(err){
                        res.json(err);
                    }
                });
                logger.debug('updated successfully.');
                res.status(HttpStatus.OK).json({message:'Product with given modelNumber is updated!!!'});
            }
        })
    }
    else{
        logger.debug('access-denied');
        res.status(400).json(apiUtils.getResponseMessage(400,'you are not authorized to perform this action'));
    }
});

//THIS IS TO DELETE A PRODUCT
router.delete('/delete',verifyUser,(req,res)=>{
    logger.debug('inside delete api');
    if(req.user.role=='admin'){
        productSchema.findOneAndDelete({modelNumber:req.body.modelNumber},function(err,result){
            if(err){res.json(err);}
            else{
                if(result===null)
                {
                    logger.debug('product not found');
                    res.status(HttpStatus.BAD_REQUEST).json({message:"product not found"});
                }
                else{
                logger.debug('deleted successfully');
                res.status(HttpStatus.OK).json({message:'Product with given modelNumber is deleted!!!'});
                }
            }
        });
    }
    else{
        logger.debug('access-denied');
        res.status(400).json(apiUtils.getResponseMessage(400,'you are not authorized to perform this action'));
    }
});


module.exports=router;

