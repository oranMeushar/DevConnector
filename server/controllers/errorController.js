const AppError = require('../util/AppError');


const handleErrorDev = (error, res) =>{
    res.status(error.statusCode).json({
        status:error.status,
        message:error.message,
        stack:error.stack,
        errors:error.errors
    })
}

const handleErrorProd = (error, res) =>{
    let message = error.isOperational ? error.message:
    'Something went wrong please try again later.';
    res.status(error.statusCode).json({
        status:error.status,
        message,
        errors:error.errors
    });
};

const handleCastError = (error) =>{
    const message = `Invalid value for ${error.path}`;
    return new AppError(message, 'Failed', 400);
}

const handleValidationError = (error) =>{
    let message = '';
    for (const key in error.errors) {
        message += error.errors[key].message + ','
    }
    return new AppError(message.slice(0, message.length-1), 'Failed', 400);
}

const handleDuplicateFieldError = (error) =>{
    return new AppError(' E11000 Email already exists', 'Failed', 400);
}

const errorController = (error, req, res, next) =>{
    error.statusCode = error.statusCode || 500;
    error.message = error.message || 'Server error';

    if (process.env.NODE_ENV === 'development') {
        handleErrorDev(error, res);
    }else{
        let err = {...error};
        if (error.name === 'CastError') {
            err = handleCastError(error);
            err.errors = error.errors
        }
        if (error.name === 'ValidationError') {
           err = handleValidationError(error);
           err.errors = error.errors
        }
        if (error.code == '11000') {
           err = handleDuplicateFieldError(error); 
           err.errors = error.errors
        }
        handleErrorProd(err, res);
    }
    

}

module.exports = errorController;