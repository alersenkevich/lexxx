import { BinanceSocketHandler, ITicker } from '../lib/api/websocket/binance';
import { Mongoose } from 'mongoose';
import {
  gracefulExit,
  uncaughtException,
  unhandledRejection,
} from '../lib/helpers';

export const bootstrap = (mongoose: Mongoose) => {
  process
    .on('uncaughtException', uncaughtException)
    .on('unhandledRejection', unhandledRejection)
    .on('SIGINT', gracefulExit(mongoose.connection))
    .on('SIGTERM', gracefulExit(mongoose.connection));

  // Runing factories and some else application boot stuff
  const binanceSocketHandler = new BinanceSocketHandler();
  binanceSocketHandler.on('24hrTicker', (ticker: ITicker) => console.log());
};
