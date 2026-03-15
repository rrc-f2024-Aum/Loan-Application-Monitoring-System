import { Request, Response, NextFunction } from "express";
import { Loan, sampleData } from "../models/loanModel";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { errorResponse, successResponse } from "../models/responseModel" 

// Helper functions
const validateLoanId = (req: Request, res: Response): number | null => {
    const { id } = req.params;

    if (Array.isArray(id)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
            errorResponse("Invalid loan ID format", "INVALID_ID_FORMAT")
        );
        return null;
    }

    const loanId = parseInt(id);
    if (isNaN(loanId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
            errorResponse("Invalid loan ID", "INVALID_ID")
        );
        return null;
    }

    return loanId;
}

const findLoanIndex = (loanId: number): number => {
    return sampleData.findIndex(l => l.id === loanId);
}

const handleLoanNotFound = (res: Response, loanId: number): boolean => {
    const index = findLoanIndex(loanId);
    if (index === -1) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            errorResponse("Loan application not found", "LOAN_NOT_FOUND")
        );
        return true;
    }
    return false;
};

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
export const getLoans = async(
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        res.status(HTTP_STATUS.OK).json(
            successResponse(sampleData, "Loan applications retrieved successfully", 
                sampleData.length)
        );
    } catch (error) {
        next(error);
    }
};

// get loan by ID
export const getLoanById = async (
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const loanId = validateLoanId(req, res);
        if (loanId === null) return;
        
        if (handleLoanNotFound(res, loanId)) return;

        const loan = sampleData[findLoanIndex(loanId)];
        res.status(HTTP_STATUS.OK).json(
            successResponse(loan, "Loan application retrieved successfully")
        );
    
    } catch (error) {
        next(error);
    }
};  

// update loan by ID 
export const updateLoan = async(
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const loanId = validateLoanId(req, res);
        if (loanId === null) return;
        
        if (handleLoanNotFound(res, loanId)) return;

        const { applicant, amount, status } = req.body;
        const loanIndex = findLoanIndex(loanId);

        sampleData[loanIndex] = {
            ...sampleData[loanIndex],
            applicant: applicant || sampleData[loanIndex].applicant,
            amount: amount ? Number(amount) : sampleData[loanIndex].amount,
            status: status || sampleData[loanIndex].status
        };

        res.status(HTTP_STATUS.OK).json(
            successResponse(sampleData[loanIndex], "Loan application updated successfully")
        );
    
    } catch (error) {
        next(error);
    }
}

// delete loan by ID
export const deleteLoan = async(
    req:Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const loanId = validateLoanId(req, res);
        if (loanId === null) return;
        
        if (handleLoanNotFound(res, loanId)) return;

        const loanIndex = findLoanIndex(loanId);
        sampleData.splice(loanIndex, 1);
        res.status(HTTP_STATUS.NO_CONTENT).send();
    
    } catch (error) {
        next(error);
    }
};