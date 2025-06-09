import jwt from 'jsonwebtoken';

const FetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    const JWT_Signature = "bookWise@";

    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, JWT_Signature);
        req.user = data.user;
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }
};

export default FetchUser;
