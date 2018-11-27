import * as WebSocket from 'ws';
import { convertObjectPropertiesNames as convert } from '../../../helpers';
import { AbstractSocketEventWrapper } from '../abstract-socket-event-wrapper';
import {
  exchangesSettings, exchangesCoinsTickers as tickers, products, bases,
} from '../../../../config';

const converterValues = {
  aggTrade: {
    p: 'price',
    s: 'symbol',
    M: 'ignore',
    q: 'quantity',
    e: 'eventType',
    E: 'eventTime',
    T: 'tradeTime',
    l: 'lastTradeId',
    f: 'firstTradeId',
    m: 'isMarketMaker',
    a: 'aggregateTradeId',
  },
  trade: {
    p: 'price',
    s: 'symbol',
    M: 'ignore',
    t: 'tradeId',
    q: 'quantity',
    e: 'eventType',
    E: 'eventTime',
    T: 'tradeTime',
    b: 'buyerOrderId',
    a: 'sellerOrderId',
    m: 'isMarketMaker',
  },
  '24hrMiniTicker': {
    l: 'lowPrice',
    e: 'eventType',
    E: 'eventTime',
    o: 'openPrice',
    h: 'highPrice',
    c: 'currentDayClosePrice',
    v: 'totalTradedBaseAssetVolume',
    q: 'totalTradedQuoteAssetVolume',
  },
  '24hrTicker': {
    e: 'eventType',
    E: 'eventTime',
    s: 'symbol',
    p: 'priceChange',
    P: 'priceChangePercent',
    w: 'weightedAveragePrice',
    x: 'previousDayClosePrice',
    c: 'currentDayClosePrice',
    Q: 'closeTradeQuantity',
    b: 'bestBidPrice',
    B: 'bestBidQuantity',
    a: 'bestAskPrice',
    A: 'bestAskQuantity',
    o: 'open',
    h: 'high',
    l: 'low',
    v: 'totalTradedBaseAssetVolume',
    q: 'totalTradedQuoteAssetVolume',
    O: 'statisticsOpenTime',
    C: 'statisticsCloseTime',
    F: 'firstTradeId',
    L: 'lastTradeId',
    n: 'totalNumberOfTrades',
  },
  kline: {
    stream: 'stream',
    e: 'eventType',
    E: 'eventTime',
    s: 'symbol',
    k: {
      parentPropName: 'kline',
      t: 'klineStartTime',
      T: 'klineCloseTime',
      s: 'symbol',
      i: 'interval',
      f: 'firstTradeId',
      L: 'lastTradeId',
      o: 'open',
      c: 'close',
      h: 'high',
      l: 'low',
      v: 'baseAssetVolume',
      n: 'numberOfTrades',
      x: 'isKlineClosed',
      q: 'quoteAssetVolume',
      V: 'takerBuyBaseAssetVolume',
      Q: 'takerBuyQuoteAssetVolume',
      B: 'ignore',
    },
  },
};

export interface IAggregatedSymbolTrades {
  eventType:    'aggTrade';
  eventTime:        number;
  symbol:           string;
  aggregateTradeId: number;
  price:            string;
  quantity:         string;
  firstTradeId:     number;
  lastTradeId:      number;
  tradeTime:        number;
  isMarketMaker:   boolean;
  ignore:          boolean;
}

export interface ITrade {
  eventType:       'trade';
  eventTime:        number;
  symbol:           string;
  tradeId:          number;
  price:            string;
  quantity:         string;
  buyerOrderId:     number;
  sellerOrderId:    number;
  tradeTime:        number;
  isMarketMaker:   boolean;
  ignore:          boolean;
}

export interface ITicker {
  eventType:            '24hrTicker';
  eventTime:                  number;
  symbol:                     string;
  priceChange:                string;
  priceChangePercent:         string;
  weightedAveragePrice:       string;
  previousDayClosePrice:      string;
  currentDayClosePrice:       string;
  closeTradeQuantity:         string;
  bestBidPrice:               string;
  bestBidQuantity:            string;
  bestAskPrice:               string;
  bestAskQuantity:            string;
  open:                       string;
  high:                       string;
  low:                        string;
  totalTradedBaseAssetVolume: string;
  totalTradedQuoteAssetVolume:string;
  statisticsOpenTime:         number;
  statisticsCloseTime:        number;
  firstTradeId:               number;
  lastTradeId:                number;
  totalNumberOfTrades:        number;
}

export interface IKline {
  stream:                     string;
  eventType:                 'kline';
  eventTime:                  number;
  symbol:                     string;
  kline: {
    klineStartTime:           number;
    klineCloseTime:           number;
    symbol:                   string;
    interval:                 string;
    firstTradeId:             number;
    lastTradeId:              number;
    open:                     string;
    close:                    string;
    high:                     string;
    low:                      string;
    baseAssetVolume:          string;
    numberOfTrades:           number;
    isKlineClosed:           boolean;
    quoteAssetVolume:         string;
    takerBuyBaseAssetVolume:  string;
    takerBuyQuoteAssetVolume: string;
    ignore:                   string;
  };
}

export interface IMiniTicker {
  eventType:          '24hrMiniTicker';
  eventTime:                    number;
  symbol:                       string;
  currentDayClosePrice:         string;
  open:                         string;
  high:                         string;
  low:                          string;
  totalTradedBaseAssetVolume:   string;
  totalTradedQuoteAssetVolume:  string;
}

export interface ISocketMessage {
  e?: string;
  stream: string;
  data: IAggregatedSymbolTrades | IKline | IMiniTicker | ITrade | ITicker;
}

export class BinanceSocketHandler extends AbstractSocketEventWrapper {
  public title: string = 'binance';

  constructor() { super(); this.initSocket(); }

  public async initSocket(): Promise<void> {
    // Turn off the socket if was on earlier or if we switch-reset socket from other place
    if (this.socket !== null) this.disableSocket();
    // Get socket url and/or other options
    const { url } = exchangesSettings.binance.socket;
    // Generate request binance socket string for streams
    const requestString = await this.generateRequestString(products, bases, 'ticker');

    this.socket = new WebSocket(`${url}?streams=${requestString}`);
    this.socket.on('unexpected-response', this.reconnectSocket);
    this.socket.on('open', this.initMessagesHandling);
    this.socket.on('error', this.reconnectSocket);
  }

  private initMessagesHandling = (): void => {
    this.socket.on('message', async (msg: string) => {
      const { data, data: { e } } = JSON.parse(msg);
      const message = await convert<ITicker>(data, converterValues[e]);
      this.emit(message.eventType, message);
    });
  }

  private async generateRequestString(products: string[], bases: string[], event: string): Promise<string> {
    return (await Promise.all(products.map(
      product => Promise.all(bases.map(base => base !== product
          ? tickers.global[product] + tickers[base === 'tether' ? 'binance' : 'global'][base]
          : null,
      )),
    ))).reduce((acc, val) => [...acc, ...val], []).filter(v => v !== null).join(`@${event}/`) + `@${event}`;
  }
}
