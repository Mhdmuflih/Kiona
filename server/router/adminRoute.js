import express from "express";
import multer from "multer";
import path from "path";
import session from "express-session";


import { adminHome, adminLogin, adminLogout, adminRegister, insertAdmin, verifyAdminLogin } from "../controller/adminController.js";
import { productPage, addProduct, productAdd, deleteProduct, deletedProductPage, restoreProduct, editProduct, editProductPage, deleted  } from "../controller/adminProductController.js";
import { userDetails, userBlock } from "../controller/adminUserController.js";
import { addCategory, categoryDeleted, categoryPage, createCategory, deleteCategory, deleteCategoryPage, editCategory, editCategoryPage, restoreCategory } from "../controller/adminCategoryController.js";
import { isLogin, isLogout, Cache } from "../middleware/adminAuth.js";


// ------------------------------------------------------------------------------------------------------------------

const admin_route = express();              //expression connection
// -----------------------------

const __dirname = path.resolve();

//session working code
admin_route.use(session({
    secret:'IhopeWithYou',
    resave:false,
    saveUninitialized:true
}))

admin_route.use(express.static('assets'))

admin_route.use(Cache)                                  //clear Cache. in there (admin login after click the back button no go the back page)

// -----------------------------------------------------------------------
//image storing in using multer product

const store = multer.diskStorage({

    destination:function(req,file,cb){
        console.log(file)
        cb(null,path.join(__dirname, 'assets/Photos/product'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})

const upload = multer({ storage: store }).array('images', 5);
// -----------------------------------------------------------------------

// storage photo in category
const storageCategory = multer.diskStorage({
    destination: function(req, file, callback) {
        console.log(file);
        callback(null, path.join(__dirname, 'assets/Photos/category'));
    },
    filename: function(req, file, callback) {
        const name = Date.now() + "-" + file.originalname;
        callback(null, name);
    }
});

const uploadCategory = multer({ storage: storageCategory });
// -----------------------------------------------------------------------

//admin login
admin_route.get('/',isLogout,adminLogin)
admin_route.post('/',verifyAdminLogin)

//admin register
admin_route.get('/register',isLogout,adminRegister)                         //admin register page
admin_route.post('/register',insertAdmin)                                   //insert Admin

//admin home page
admin_route.get('/home',isLogin,adminHome)                                  //admin home page

//admin Logout
admin_route.get('/logout',isLogin,adminLogout)                              //Logout

//admin user management
admin_route.get('/users',isLogin,userDetails);
admin_route.post('/users/block',userBlock)                                  //post method is using axiox in back end

//product management
admin_route.get('/product',isLogin,productPage)                             //product list page route

admin_route.get('/add_product',isLogin,addProduct)                          // Add product page route
admin_route.post('/add_product',upload , productAdd)                        //product adding using post

admin_route.get('/deletedProduct',isLogin,deletedProductPage)               //delete product page route
admin_route.post('/product/delete', deleteProduct)                          //product soft delete route
admin_route.post('/product/restore',restoreProduct)                         //re-store the product
admin_route.post('/product/deleted',deleted)                                //product delete the db route

admin_route.get('/editProduct',isLogin,editProductPage)                     //edit product page route
admin_route.post('/editProduct',upload,editProduct)                         //edit product


//category management
admin_route.get('/category',isLogin,categoryPage)                           //category page
admin_route.get('/add_category',isLogin,addCategory)                        //add category page
admin_route.post('/add_category', uploadCategory.single('image'),createCategory)  //add Category

admin_route.get('/edit_category',editCategoryPage)                          //edit Category page
admin_route.post('/edit_category',uploadCategory.single('image'),editCategory)  //edit category

admin_route.get('/deleteCategory',deleteCategoryPage)                       //soft delete category page
admin_route.post('/category/delete',deleteCategory)                         //delete main page
admin_route.post('/category/restore',restoreCategory)                       //restore the soft delete page to main page
admin_route.post('/category/deleted',categoryDeleted)                       //delete in db



export default admin_route;