const isLogin = async (req,res,next)=>{
    try {
        
        if(req.session.admin_id){
            next();
        }else{
            res.redirect('/admin');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req,res,next)=>{
    try {
        
        if(!req.session.admin_id){
            next();
        }else{
            res.redirect('/admin/home');
        }

    } catch (error) {
        console.log(error.message);
    }
}

//Cache Management
const Cache = async (req,res,next)=>{
    try {

        res.header('Cache-Control','private, no-cache, no-store, must-revalidate');
        res.header('Expire', '-1');
        res.header('Kiona','no-cache');
        next();

    } catch (error) {
        console.log(error.message);
    }
}

export{
    isLogin,
    isLogout,
    Cache
}