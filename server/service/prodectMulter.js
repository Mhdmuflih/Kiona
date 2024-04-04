import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination:(req, file, callback)=>{
        const publicDirectery = path.resolve();
        const destinationPath =  path.join(publicDirectery,'assets/Photos/product')
        callback(null,destinationPath);
    },
    filename:(req,file,callback)=>{
        const extention = file.originalname.substring(file.originalname.lastIndexOf('.'));
        callback(null,`${file.fieldname}-${Date.now()}${extention}`);
    }
})

export default multer({storage})