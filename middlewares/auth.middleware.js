import jwt from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) { 
        return next(new AppError('You are not logged in. Please log in to get access', 401));
        
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = userDetails;

    next();
};

export { isLoggedIn };
