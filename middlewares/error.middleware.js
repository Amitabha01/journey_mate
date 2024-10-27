
const errorMiddleware = (err, req, res, next) => {
    const {message, statusCode} = err;
    
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    return res.status(err.statusCode).json({
           status: 'error',
           success: false,
           statusCode,
           stack: err.stack,
           message: err.message
    });
};

export default errorMiddleware;

/*
const AppError = (fn) => async (req, res, next) => {
    try {
       await fn(req, res, next);
    } catch (error) {
      res.status(error.statusCode).json({
        success: false,
        status: error.status,
        message: error.message,
      });
    }
  };
  */
 
// or

 /*
const AppError = async function (message, statusCode) {
  (req, res, next) => {
    Promise.resolve(requestAppError(req, res, next)).catch((err) => next(err));
  };
}
*/