import * as WebSocket from 'ws';
import { EventEmitter } from 'events';

export abstract class AbstractSocketEventWrapper extends EventEmitter {
  public title: string;
  protected socket: WebSocket = null;
  public abstract initSocket(): void;
  protected abstract initMessagesHandling(): void;

  constructor() { super(); }

  public reconnectSocket = (error?: any): void => {
    console.log(error);
    console.log('trying to reconnect to Socket');
    this.initSocket();
  }

  public disableSocket = (): void => {
    this.socket.close();
    this.socket = null;
  }
}
