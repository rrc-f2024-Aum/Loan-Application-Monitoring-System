import { Request, Response, NextFunction } from "express";
import { UserRecord } from "firebase-admin/auth";
import { auth } from "../../../config/firebaseConfig";
import { errorResponse, successResponse } from "../models/responseModel";
import { HTTP_STATUS } from "../../../constants/httpConstants";

export const getUserDetails = async (
    req: Request, res: Response, next:NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        if(Array.isArray(id)) {
            res.status(HTTP_STATUS.BAD_REQUEST).json(
                errorResponse("Invalid user ID format", "INVALID_ID_FORMAT")
            ); 
            return;
        }

        const user: UserRecord = await auth.getUser(id);

        res.status(HTTP_STATUS.OK).json(
            successResponse(user, "User details retrieved successfully")
        );

    } catch (error) {
        next(error);
    }
};