import { Request, Response } from "express";
import isAuthorized from "../src/api/v1/middleware/authorize";
import { AuthorizationError } from "../src/api/v1/errors/errors";
import { AuthorizationOptions } from "../src/api/v1/models/loanModel";

describe("Authorization Middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
        // Reset for each test
        mockRequest = {
            params: {},
        };

        mockResponse = {
            locals: {},
        };

        nextFunction = jest.fn();
    });

    it("should call next() when user has required role", () => {
        // Arrange
        mockResponse.locals = {
            uid: "user-123",
            role: "admin",
        };

        const options: AuthorizationOptions = {
            hasRole: ["admin", "manager"],
        };

        const middleware = isAuthorized(options);

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith();
        expect(nextFunction).not.toHaveBeenCalledWith(expect.any(AuthorizationError));
    });

    it("should call next with AuthorizationError when role is missing", () => {
        // Arrange
        mockResponse.locals = {
            uid: "user-123",
            // No role specified
        };

        const options: AuthorizationOptions = {
            hasRole: ["admin"],
        };

        const middleware = isAuthorized(options);

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
        
        const error = nextFunction.mock.calls[0][0];
        expect(error.message).toBe("Forbidden: No role found");
        expect(error.code).toBe("ROLE_NOT_FOUND");
        expect(error.statusCode).toBe(403);
    });

    it("should call next with AuthorizationError when user has insufficient role", () => {
        // Arrange
        mockResponse.locals = {
            uid: "user-123",
            role: "user",
        };

        const options: AuthorizationOptions = {
            hasRole: ["admin"],
        };

        const middleware = isAuthorized(options);

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
        
        const error = nextFunction.mock.calls[0][0];
        expect(error.message).toBe("Forbidden: Insufficient role");
        expect(error.code).toBe("INSUFFICIENT_ROLE");
        expect(error.statusCode).toBe(403);
    });

    it("should call next() when allowSameUser is true and IDs match", () => {
        // Arrange
        const userId = "user-123";

        mockRequest.params = {
            id: userId,
        };

        mockResponse.locals = {
            uid: userId,
            role: "user", // Normally wouldn't have access
        };

        const options: AuthorizationOptions = {
            hasRole: ["admin"],
            allowSameUser: true,
        };

        const middleware = isAuthorized(options);

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith();
        expect(nextFunction).not.toHaveBeenCalledWith(expect.any(AuthorizationError));
    });

    it("should call next with AuthorizationError when allowSameUser is false even if IDs match", () => {
        // Arrange
        const userId = "user-123";

        mockRequest.params = {
            id: userId,
        };

        mockResponse.locals = {
            uid: userId,
            role: "user",
        };

        const options: AuthorizationOptions = {
            hasRole: ["admin"],
            allowSameUser: false, // Explicitly disabled
        };

        const middleware = isAuthorized(options);

        // Act
        middleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Assert
        expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthorizationError));
        
        const error = nextFunction.mock.calls[0][0];
        expect(error.message).toBe("Forbidden: Insufficient role");
        expect(error.code).toBe("INSUFFICIENT_ROLE");
    });
});