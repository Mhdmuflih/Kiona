import Category from "../../model/categoryModel.js";

// -----------------------------------------------------------------

//category page
const categoryPage = async(req, res, next)=>{
    try {

        var search = '';
        if(req.query.search){
            search = req.query.search;
        }

        var page = 1;
        if(req.query.page){
            page = req.query.page
        }

        const limit = 4

        const categoryData = await Category.find({
            $and: [
                { delete: false },
                { $or:[
                    { name: { $regex: ".*" + search + ".*", $options: "i" } },
                    { email: { $regex: ".*" + search + ".*", $options: "i" } }
                ]}
            ]
        }).limit(limit*1)
        .skip((page - 1)* limit)
        .exec();

        const count = await Category.find({
            $or:[
                { name:{ $regex: ".*" + search + ".*", $options: "i" } },
                { email:{ $regex : ".*" + search + ".*", $options: "i" } }
            ]
        }).countDocuments();


        res.render('admin/Category/category.ejs',{
            category:categoryData,
            totalPages:Math.ceil(count/limit),
            currentPage:page
        })
    } catch (error) {
        console.log(error.message)
        next(error.message);
    }
}

//add category page
const addCategory = async (req, res, next)=>{
    try {
        res.render('admin/Category/addCategory.ejs');
    } catch (error) {
        res.status(404).json({message:error.message})
    }
}

//create Category
const createCategory = async (req, res) => {
    try {


        const image = req.file.filename
        const { categoryName, description } = req.body;
        
        if (!categoryName || !description || !image) {
            return res.status(400).json({ message: 'Name and description are required.' });
        }

        const category = new Category({
            image:image,
            name: categoryName,
            description: description
        });
        console.log(category);
        await category.save();
        res.status(201).json({ message: 'Category created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

//edit category page
const editCategoryPage = async (req, res, next)=>{
    try {

        const { id } = req.query

        const categoryId = await Category.findById({ _id:id })

        if(categoryId){
            res.render("admin/Category/editCategory.ejs", { category:categoryId })
        }else{
            res.redirect("/admin/category");
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);
    }
}

const editCategory = async (req, res, next)=>{
    try {

        const existingCategory = await Category.findOne({ name:req.body.name });

        if(existingCategory && existingCategory._id && existingCategory._id.toString() !== req.body.category_id){
            return res.json({success:false, message:"Category Name Already exists."})
        }

        if(req.file){
            await Category.findByIdAndUpdate({ _id:req.body.category_id }, { $set:{ name:req.body.name, description:req.body.description, image:req.file.filename } });
        }else{
            await Category.findByIdAndUpdate({ _id:req.body.category_id }, { $set:{ name:req.body.name, description:req.body.description } });
        }

        res.json({success:true, message:"Category Updated Succedfully."})

    } catch (error) {
        console.log(error.message)
        next(error.message);
    }
}

const deleteCategory = async(req, res, next)=>{
    try {

        const { id } = req.body

        const responce = await Category.updateOne( { _id:id },{ $set:{ delete:true } } )

        if(responce){
            res.json({ success:true, message:"Category delete" })
        }else{
            res.json({ success:false, message:"Server Error" })
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);
    }
}

const deleteCategoryPage = async(req, res, next)=>{
    try {

        const deletedCategory = await Category.find({delete:true})

        res.render("admin/Category/deletedCategory.ejs",{category:deletedCategory})
        
    } catch (error) {
        console.log(error.message)
        next(error.message);
    }
}

const restoreCategory = async (req, res, next)=>{
    try {
        
        const { id } = req.body

        const restore = await Category.updateOne({_id:id},{ $set:{ delete:false } })

        if(restore){
            res.json({ success:true, message:"Resotre Success" })
        }else{
            res.json({ success:false, message:"Server Error" })
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);
    }
}

const categoryDeleted = async(req, res, next)=>{
    try {
        
        const { id } = req.body

        const responce = await Category.deleteOne({ _id:id })
        if(responce){
            res.json( { success:true, message:"Category Deleted successfull" } )
        }else{
            res.json( { success:false, message:"Category Delete Failed" } )
        }

    } catch (error) {
        console.log(error.message)
        next(error.message);
    }
}

export {
    addCategory,
    categoryDeleted,
    categoryPage,
    createCategory,
    deleteCategory,
    deleteCategoryPage,
    editCategory,
    editCategoryPage,
    restoreCategory
};
