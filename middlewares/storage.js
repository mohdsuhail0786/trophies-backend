const multer=require('multer');
const path=require('path');

const Storage=multer.diskStorage({
    destination:"./public/uploads",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname));
    }
})

const upload=multer({storage:Storage});

module.exports.upload=upload;