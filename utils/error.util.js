import e from "connect-flash";

class AppError extends Error {
  constructor(
      errors = [], 
      message = 'SOMETHING WENT WRONG', 
      statusCode, 
      stack = ""
    ) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      this.data = null;
      this.success = false;
      this.message = message;
      this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    } 
  }
};


export default AppError ;