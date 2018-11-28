import { Mongoose } from 'mongoose';
import { products, bases } from '../config';
import { BinanceSocketHandler, ITicker } from '../lib/api/websocket/binance';
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

  const binanceSocketHandler = new BinanceSocketHandler(products, bases, ['ticker', 'kline_1m']);
  binanceSocketHandler.on('24hrTicker', ticker => console.log(ticker));
};
