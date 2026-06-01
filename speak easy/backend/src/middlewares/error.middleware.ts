import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Express Error Handler:', err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Something went wrong inside the server.';
  res.status(status).json({ error: message });
};
