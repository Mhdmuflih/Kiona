const isLogin = async (req,res,next)=>{
    try {
        if(req.session.user_id){
            next();
        }else{
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async (req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/home');
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message)
    }
}

const Cache = async (req,res,next)=>{
    try {
        
        res.header("Cache-Control",'private, no-cache, no-store, mus-revalidate');
        res.header('Expire', '-1');
        res.header('kiona', 'no-cache');
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