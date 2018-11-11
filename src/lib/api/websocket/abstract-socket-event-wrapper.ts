import * as WebSocket from 'ws';
import { EventEmitter } from 'events';

export abstract class AbstractSocketEventWrapper extends EventEmitter {
  protected socket: WebSocket = null;
  public abstract initSocket(): void;

  constructor() {
    super();
    this.on('newListener', (event, listener) => this.initSocket());
  }

  public reconnectSocket(error?: any): void {
    console.log(error);
    console.log('trying to reconnect to Socket');
    this.initSocket();
  }

  public disableSocket(): void {
    this.socket.close();
    this.socket = null;
  }
}
