import { NextFunction, Request, Response } from "express";


const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    try {
        console.error(err); // log full error for debugging

        let statusCode = err.statusCode || 500;
        let message = err.message || "Server Error";

        // Mongoose bad ObjectId
        if (err.name === "CastError") {
            statusCode = 404;
            message = "Resource not found";
        }

        // Mongoose duplicate key
        else if (err.code === 11000) {
            statusCode = 400;
            const field = Object.keys(err.keyValue || {}).join(", ");
            message = `Duplicate field value entered: ${field}`;
        }

        // Mongoose validation error
        else if (err.name === "ValidationError") {
            statusCode = 400;
            message = Object.values(err.errors)
                //@ts-ignore
                .map(value => value.message)
                .join(", ");
        }

        // JWT errors
        else if (err.name === "JsonWebTokenError") {
            statusCode = 401;
            message = "Invalid token. Please log in again.";
        }
        else if (err.name === "TokenExpiredError") {
            statusCode = 401;
            message = "Token expired. Please log in again.";
        }

        // Syntax errors (e.g., JSON parse)
        //@ts-ignore
        else if (err instanceof SyntaxError && err.body) {
            statusCode = 400;
            message = "Malformed JSON in request body.";
        }

        // Type errors
        else if (err instanceof TypeError) {
            statusCode = 500;
            message = "Internal server error (TypeError)";
        }

        // Axios or fetch request errors
        else if (err.isAxiosError || err.response) {
            statusCode = err.response?.status || 500;
            message = err.response?.data?.message || err.message;
        }

        // Database errors (generic)
        else if (err.name === "MongoError" || err.code) {
            statusCode = 500;
            message = `Database error: ${err.message}`;
        }

        // Any other unknown errors
        if (Array.isArray(message)) {
            message = message.join(", \n");
        }

        res.status(statusCode).json({
            success: false,
            error: message,
        });
    } catch (middlewareError) {
        console.error("Error in errorMiddleware:", middlewareError);
        res.status(500).json({
            success: false,
            error: "Something went wrong in the error handler",
        });
    }
};

export default errorMiddleware;