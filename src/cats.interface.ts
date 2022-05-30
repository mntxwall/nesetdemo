import {NextFunction} from "express";

export interface Cat {
  name: string;
  age: number;
  breed: string;
}

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request ${req}`);
  next();
}