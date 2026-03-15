import { Request, Response } from "express";
import authenticate from "../src/api/v1/middleware/authenticate";
import { auth } from "../src/config/firebaseConfig";
import { AuthenticationError } from "../src/api/v1/errors/errors";

// Mock the Firebase config module
jest.mock("../src/config/firebaseConfig", () => ({
    auth: {
        verifyIdToken: jest.fn(),
    },
}));

describe("Authentication Middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
        // Reset mocks between tests
        jest.clearAllMocks();

        // Set up basic mock objects
        mockRequest = {
            headers: {},
        };

        mockResponse = {
            locals: {},
        };

        nextFunction = jest.fn();
    });

    it("should call next with AuthenticationError when no token is provided", async () => {
        // Act
        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith(
            expect.any(AuthenticationError)
        );
        
        const error = nextFunction.mock.calls[0][0];
        expect(error.message).toBe("Unauthorized: No token provided");
        expect(error.code).toBe("TOKEN_NOT_FOUND");
        expect(error.statusCode).toBe(401);
    });

    it("should call next with AuthenticationError when token is invalid", async () => {
        // Arrange
        mockRequest.headers = {
            authorization: "Bearer invalid-token-123",
        };

        // Mock the Firebase auth response
        (auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(
            new Error("Firebase Error: Invalid token")
        );

        // Act
        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(auth.verifyIdToken).toHaveBeenCalledWith("invalid-token-123");
        expect(nextFunction).toHaveBeenCalledWith(
            expect.any(AuthenticationError)
        );
        
        const error = nextFunction.mock.calls[0][0];
        expect(error.message).toContain("Unauthorized:");
        expect(error.code).toBeDefined();
        expect(error.statusCode).toBe(401);
    });

    it("should call next() and set user data when token is valid", async () => {
        // Arrange
        mockRequest.headers = {
            authorization: "Bearer valid-token-456",
        };

        const mockDecodedToken = {
            uid: "user-123",
            role: "admin",
        };

        // Mock successful token verification
        (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(
            mockDecodedToken
        );

        // Act
        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(auth.verifyIdToken).toHaveBeenCalledWith("valid-token-456");
        expect(mockResponse.locals).toEqual({
            uid: "user-123",
            role: "admin",
        });
        expect(nextFunction).toHaveBeenCalledWith(); // Called with no arguments
    });

    it("should handle malformed authorization header", async () => {
        // Arrange - header without "Bearer " prefix
        mockRequest.headers = {
            authorization: "Basic some-credentials",
        };

        // Act
        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith(
            expect.any(AuthenticationError)
        );
        
        const error = nextFunction.mock.calls[0][0];
        expect(error.message).toBe("Unauthorized: No token provided");
        expect(error.code).toBe("TOKEN_NOT_FOUND");
    });
});