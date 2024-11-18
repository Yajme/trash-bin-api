class UserError extends Error{
    constructor(message, statusCode,identifiers){
        super(message);
        this.name = this.constructor.name;
        this.status = statusCode;
        this.data = identifiers;

        if(Error.captureStackTrace){
            Error.captureStackTrace(this, this.constructor);
        }
    }
}


export {UserError};