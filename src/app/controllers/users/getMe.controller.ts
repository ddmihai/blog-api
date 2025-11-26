import { Request, Response } from "express";

export const getMe = (req: Request, res: Response) => {
    try {
        if (!(req as any).user) {
            return res.status(404).json({
                message: 'User not found',
                status: 404
            });
        };

        return res.status(200).json({
            user: (req as any).user,
            status: 200
        });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
};
