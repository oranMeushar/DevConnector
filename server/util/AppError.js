class AppError extends Error {
    constructor(message, status, statusCode){
        super();
        this.message = message;
        this.status = status;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

module.exports = AppError;