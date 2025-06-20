import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_Signature = process.env.JWT_SIGNATURE;

const FetchUser = (req, res, next) => {
    const token = req.header('auth-token');

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
