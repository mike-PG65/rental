const jwt = require("jsonwebtoken")

const adminMiddleware = (req, res, next) => {
    try{
        if(req.user)
            return res.status(401).json({error: "Unauthorized!"})

        if(decoded.role === !admin)
            return res.status(403).json({error: "Access denied, Admins only!!"}) 

        next()
    } catch(err){
        res.status(500).json({error: "Server error!!"})
    }
}

module.exports = adminMiddleware