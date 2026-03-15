import express from "express";
import { 
    createLoan,
    getLoans, 
    getLoanById,
    updateLoan,
    deleteLoan
 } from "../controllers/loanController";
import authenticate from "../middleware/authenticate";
import isAuthorized from "../middleware/authorize";

const router = express.Router();

// Get - health check endpoint
router.get("/health", (req,res) =>{
    res.status(200).json({
        success: true,
        message: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Post - Create loan
router.post( "/loans", 
    authenticate,
    isAuthorized({ hasRole: ['admin', 'manager']}), 
    createLoan
)
// Get - All loans
router.get("/loans", 
    authenticate,
    getLoans
)

// Get - Loan by Id
router.get("/loans/:id",
    authenticate,
    getLoanById
)

// Put - Update loan by Id
router.put("/loans/:id",
    authenticate,
    isAuthorized({ hasRole: ['admin', 'manager']}),
    updateLoan
)

// Delete - Delete loan by Id
router.delete("/loans/:id",
    authenticate,
    isAuthorized({ hasRole: ["admin"]}),
    deleteLoan
) 

export default router;