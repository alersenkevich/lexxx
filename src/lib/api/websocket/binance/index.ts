import * as WebSocket from 'ws';
import { AbstractSocketEventWrapper } from '../abstract-socket-event-wrapper';

export interface IAggregatedSymbolTrades {
  e: 'aggTrade';    // Event type
  E: number;        // Event time
  s: string;        // Symbol
  a: number;        // Aggregate trade ID
  p: string;        // Price
  q: string;        // Quantity
  f: number;        // First trade ID
  l: number;        // Last trade ID
  T: number;        // Trade time
  m: boolean;       // Is the buyer the market maker?
  M: boolean;       // Ignore
}

export interface ITrade {
  e: 'trade';       // Event type
  E: number;        // Event time
  s: string;        // Symbol
  t: number;        // Trade ID
  p: string;        // Price
  q: string;        // Quantity
  b: number;        // Buyer order ID
  a: number;        // Seller order ID
  T: number;        // Trade time
  m: boolean;       // Is the buyer the market maker?
  M: boolean;       // Ignore
}

export interface ITicker {
  e: '24hrTicker';  // Event type
  E: number;        // Event time
  s: string;        // Symbol
  p: string;        // Price change
  P: string;        // Price change percent
  w: string;        // Weighted average price
  x: string;        // Previous day's close price
  c: string;        // Current day's close price
  Q: string;        // Close trade's quantity
  b: string;        // Best bid price
  B: string;        // Best bid quantity
  a: string;        // Best ask price
  A: string;        // Best ask quantity
  o: string;        // Open price
  h: string;        // High price
  l: string;        // Low price
  v: string;        // Total traded base asset volume
  q: string;        // Total traded quote asset volume
  O: number;        // Statistics open time
  C: number;        // Statistics close time
  F: number;        // First trade ID
  L: number;        // Last trade Id
  n: number;        // Total number of trades
}

export interface IKline {
  stream: string;
  e: 'kline';       // Event type
  E: number;        // Symbol
  s: string;        // Symbol
  k: {
    t: number;      // Kline start time
    T: number;      // Kline close time
    s: string;      // Symbol
    i: string;      // Interval
    f: number;      // First trade ID
    L: number;      // Last trade ID
    o: string;      // Open price
    c: string;      // Close price
    h: string;      // High price
    l: string;      // Low price
    v: string;      // Base asset volume
    n: number;      // Number of trades
    x: boolean;     // Is this kline closed?
    q: string;      // Quote asset volume
    V: string;      // Taker buy base asset volume
    Q: string;      // Taker buy quote asset volume
    B: string;      // Ignore
  };
}

export interface IMiniTicker {
  e: '24hrMiniTicker';  // Event type
  E: number;            // Event time
  s: string;            // Symbol
  c: string;            // Current day's close price
  o: string;            // Open price
  h: string;            // High price
  l: string;            // Low price
  v: string;            // Total traded base asset volume
  q: string;            // Total traded quote asset volume
}

export interface ISocketMessage {
  stream: string;
  e?: string;
  data: any;
}

export class BinanceSocketHandler extends AbstractSocketEventWrapper {
  constructor(private requestString: string) { super(); }

  public initSocket(): void {
    if (this.socket !== null) this.disableSocket();

    this.socket = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${this.requestString}`,
    );
    this.socket.on('open', this.initMessagesHandling);
    this.socket.on('error', this.reconnectSocket);
    this.socket.on('unexpected-response', this.reconnectSocket);
  }

  private initMessagesHandling(): void {
    this.socket.on('message', async (msg: string) => {
      const message: ISocketMessage = JSON.parse(msg);
      this.emit(message.data.e, message);
    });
  }
}
