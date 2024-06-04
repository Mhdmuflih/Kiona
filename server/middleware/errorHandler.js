const internalServerError = async (req,res,next)=>{
    res.status(500).render('users/500.ejs')
}

const pageNotFount = async (req,res,next)=> {
    res.status(404).render('users/404.ejs');
}

export {
    internalServerError,
    pageNotFount
}