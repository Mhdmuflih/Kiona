import User from "../../model/userModel.js";

// user handle page
const userDetails = async (req, res, next)=>{
    try {

        var search = '';
        if(req.query.search){
            search = req.query.search;
        }

        var page = 1;
        if(req.query.page){
            page = req.query.page
        }

        const limit = 5

        const userData = await User.find({
            is_admin:0,
            $or:[
                { name:{ $regex: ".*" + search + ".*", $options: "i" } },
                { email:{ $regex: ".*" + search + ".*", $options: "i" } }
            ]
        }).limit(limit*1)
        .skip((page - 1)* limit)
        .exec();

        const count = await User.find({
            is_admin:0,
            $or:[
                { name:{ $regex: ".*" + search + ".*", $options: "i" } },
                { email:{ $regex : ".*" + search + ".*", $options: "i" } }
            ]
        }).countDocuments();


        res.render('admin/UserDetails/users.ejs',{
            users: userData,
            totalPages: Math.ceil(count/limit),
            currentPage: page
        })


    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

//user block
const userBlock = async (req, res, next)=>{
    try {
        const {userId} = req.body;
        const responce = await User.findOne({_id:userId} )
        if(responce.is_block){
            const unblocked = await User.updateOne({_id:userId},{ $set:{ is_block:false } });
            return res.json({success:true,message:"User Unblocked"})
        }else{
            const block = await User.updateOne({_id:userId},{ $set:{ is_block:true } })
            return res.json({success:true,message:"User Blocked"})
        }

      
    } catch (error) {
        console.log(error.message);
        next(error.message);
    }
}

export {
    userBlock,
    userDetails
};
