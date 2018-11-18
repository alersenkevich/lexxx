import { Connection } from 'mongoose';

export const sleep = <T>(fn: Function, ms: number): Promise<T> => new Promise(
  resolve => setTimeout(async () => resolve(await fn()), ms),
);

export const gracefulExit = (mongooseConnection: Connection) =>
  (): Promise<void> => mongooseConnection.close((): void => {
    console.log('Mongoose connection closed');
    process.exit(1);
  });

export const convertObjectPropertiesNames = async <T>(
  object: { [propName: string]: any }, namesSubstitutes: { [propName: string]: any},
): Promise<T> => {
  const resultObject = {};

  await Promise.all(Object.entries(object).map(([propName, value]) => typeof namesSubstitutes[propName] === 'string'
    ? resultObject[namesSubstitutes[propName]] = value
    : resultObject[namesSubstitutes[propName].parentPropName] = convertObjectPropertiesNames(
      value, namesSubstitutes[propName],
    ),
  ));

  return resultObject as T;
};

export const unhandledRejection = (reason, p): void => {
  console.info('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
};

export const uncaughtException = (err): void => {
  console.info('uncaughtException', err);
  process.exit(1);
};
