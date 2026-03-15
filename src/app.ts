import express from 'express';
import morgan from 'morgan';

const app = express();
app.use(morgan("combined"));
app.use(express.json());

export default app;