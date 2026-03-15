import express from 'express';
import morgan from 'morgan';
import {
    accessLogger, errorLogger, consoleLogger
} from "./api/v1/middleware/logger"; 
import loanRoutes from "./api/v1/routes/loanRoutes";
import userRoutes from "./api/v1/routes/userRoutes";
import adminRoutes from "./api/v1/routes/adminRoutes";
import errorHandler from './api/v1/middleware/errorHandler';

const app = express();

app.use(morgan("combined"));

if (process.env.NODE_ENV === "production") {
    app.use(accessLogger);
    app.use(errorLogger);
} else {
    app.use(consoleLogger);
}

app.use(express.json());

app.use("/api/v1/", loanRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(errorHandler);

export default app;