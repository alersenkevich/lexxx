import { Connection } from 'mongoose';

export const sleep = <T>(fn: Function, ms: number): Promise<T> => new Promise(
  resolve => setTimeout(async () => resolve(await fn()), ms),
);

export const gracefulExit = (mongooseConnection: Connection) =>
  () => mongooseConnection.close(() => {
    console.log('Mongoose connection closed');
    process.exit(1);
  });

export const unhandledRejection = (reason, p) => {
  console.info('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
};

export const uncaughtException = (err) => {
  console.info('uncaughtException', err);
  process.exit(1);
};
