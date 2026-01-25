import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constant/api';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  const statusCode = res.statusCode !== HTTP_STATUS.OK ? res.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
  });
};
