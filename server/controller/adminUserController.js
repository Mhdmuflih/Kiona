import User from "../model/userModel.js"

// user handle page
const userDetails = async (req,res)=>{
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
        console.log(error.message)
    }
}

//user block
const userBlock = async (req,res)=>{
    try {
        const userId = req.query.id
        console.log(userId,'ivide korch preshnam ndd complete cheytheellaa... user block nnte ann');
        const  block = await User.findByIdAndUpdate({_id:userId},{ $set: { is_block:1 } })
      
    } catch (error) {
        console.log(error.message);
    }
}

export{
    userDetails,userBlock
}