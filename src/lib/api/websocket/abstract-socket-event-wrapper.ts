import * as WebSocket from 'ws';
import { EventEmitter } from 'events';

export abstract class AbstractSocketEventWrapper extends EventEmitter {
  protected socket: WebSocket = null;

  constructor() {
    super();
    this.on(
      'newListener',
      (event, listener) => this.initSocket(),
    );
  }

  public abstract initSocket(): void;

  public reconnectSocket(error?: any): void {
    console.log(error);
    console.log('trying to reconnect to Binance Socket');
    this.initSocket();
  }

  public disableSocket(): void {
    this.socket.close();
    this.socket = null;
  }
}
