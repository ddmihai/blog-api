"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = void 0;
const getMe = (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({
                message: 'User not found',
                status: 404
            });
        }
        ;
        return res.status(200).json({
            user: req.user,
            status: 200
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMe = getMe;
