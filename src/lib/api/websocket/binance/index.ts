import * as WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface ISocketMessage {
  stream: string;
  e?: string;
  data: any;
}

export class BinanceSocketHandler extends EventEmitter {
  private socket: WebSocket = null;

  constructor(private requestString: string) {
    super();
    this.on(
      'newListener',
      (event, listener) => this.initSocket(),
    );
  }

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

  private reconnectSocket(error?: any): void {
    console.log(error);
    console.log('trying to reconnect to Binance Socket');
    this.initSocket();
  }

  public disableSocket(): void {
    this.socket.close();
    this.socket = null;
  }
}
