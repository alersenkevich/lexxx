import * as mongoose from 'mongoose';
import { MONGO_URL } from './config';
import { bootstrap } from './init';
import {
  gracefulExit,
  uncaughtException,
  unhandledRejection,
} from './lib/helpers';

process
  .on('uncaughtException', uncaughtException)
  .on('unhandledRejection', unhandledRejection)
  .on('SIGINT', gracefulExit(mongoose.connection))
  .on('SIGTERM', gracefulExit(mongoose.connection));

mongoose
  .connect(MONGO_URL)
  .then(bootstrap, gracefulExit);
