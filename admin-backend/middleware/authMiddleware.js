const jwt = require('jsonwebtoken');

// Middleware function to verify Auth_Token
const authenticateToken = (req, res, next) => {
    // Get token from headers
    const token = req.headers['authorization'];
    // Check if token is present
    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided', status: false });
    }

    // Remove 'Bearer ' prefix if it's included
    const tokenWithoutBearer = token.split(' ')[1];

    // Verify the token
    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, user) => {
        if (err) { // Log the error for debugging purposes

            // Handle different types of JWT errors
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid Token', status: false }); // Invalid token
            }

            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token has expired', status: false }); // Expired token
            }

            if (err.name === 'NotBeforeError') {
                return res.status(401).json({ message: 'Token is not active yet', status: false }); // Token is not active
            }

            // For any other unknown errors
            return res.status(500).json({ message: 'Internal Server Error', status: false });
        }

        // Attach the user info to the request object
        req.user = user;

        // Proceed to the next middleware or route handler
        next();
    });
};

module.exports = authenticateToken;
