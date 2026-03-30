import express, { Application, Request, Response } from "express";
import cors from 'cors';
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
// import { toNodeHandler } from "better-auth/node";
// import { auth } from "./app/lib/auth";

const app: Application = express();

// app.use("/api/auth/", toNodeHandler(auth));


// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
// app.use(cors());

app.use('/api/v1', IndexRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;