import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from "./routes/user.routes.js";
import errorMiddleware from './middlewares/error.middleware.js';
import { config } from 'dotenv';

config();

const app = express();

/*
app.set("view engine", "ejs");
app.use(express.static("./public"));
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
    origin: [process.env.FRONTEND_URL],
    Credentials: true,
}));

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', (_req, res) => {
    res.send('pong');
});

//define modules

app.use('/api/v1/user', userRoutes);



// If user hits an endpoint that doesn't exist, return a 404 error
app.all('*', (_req, res) => {
    res.status(404).send('OOPS!!!404 Not Found');
});

app.use(errorMiddleware);

export default app;