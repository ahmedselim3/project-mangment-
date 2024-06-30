const status = require('statuses')
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });

const globalErorr = (err , req , res , next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErorrForDev(err, res);
    } else{
        sendErorrForProd(err , res)
    }
}

const sendErorrForDev = (err  , res)=>{
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message,
        stack: err.stack,
        error: err
    });
}


const sendErorrForProd = (err  , res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        message : err.message,
    })
}



module.exports = globalErorr