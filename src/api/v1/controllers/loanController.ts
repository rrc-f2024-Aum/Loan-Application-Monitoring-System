import { Request, Response, NextFunction } from "express";
import { Loan, sampleData } from "../models/loanModel";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { errorResponse, successResponse } from "../models/responseModel" 

// create loan
export const createLoan = async(
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const { applicant, amount } = req.body;

        if (!applicant || !amount) {
            res.status(HTTP_STATUS.BAD_REQUEST).json(
                errorResponse("Applicant and amount are required", "MISSING_FIELDS")
            );
            return;
        }

        const newLoan: Loan = {
            id: sampleData.length + 1,
            applicant,
            amount: Number(amount),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        sampleData.push(newLoan);
        res.status(HTTP_STATUS.CREATED).json(
            successResponse(newLoan, "Loan application created successfully")
        );
    
    } catch (error) {
        next(error);
    }
}

// get all loans

// get loan by ID

// update loan by ID 

// delete loan by ID