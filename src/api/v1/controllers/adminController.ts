import { Request, Response, NextFunction } from "express";
import { auth } from "../../../config/firebaseConfig";
import { successResponse, errorResponse } from "../models/responseModel";
import { HTTP_STATUS } from "../../../constants/httpConstants";

export const setCustomClaims = async (
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const { uid, claims } = req.body;

        if (!uid || !claims) {
            res.status(HTTP_STATUS.BAD_REQUEST).json(
                errorResponse("UID and claims are required", "MISSING_FIELD")
            );
            return;
        }

        if (!claims.role) {
            res.status(HTTP_STATUS.BAD_REQUEST).json(
                errorResponse("Role must be specified in claims", "MISSING_ROLE")
            );
            return;
        }
        
        const allowedRoles = ["admin", "manager", "officer"];
        if (!allowedRoles.includes(claims.role)) {
            res.status(HTTP_STATUS.BAD_REQUEST).json(
                errorResponse("Invalid role. Must be admin, manager, or officer",
                    "INVALID_ROLE")
            );
            return;
        }

        await auth.setCustomUserClaims(uid, claims);

        res.status(HTTP_STATUS.OK).json(
            successResponse({}, `Custom claims set for user: ${uid}. User must obtain a new token
                for changes to take effect`)
        );

    } catch (error) {
        next(error);
    }

}