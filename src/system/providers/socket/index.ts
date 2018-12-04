import * as WebSocket from 'ws';
import { EventEmitter } from 'events';

export class ProviderSocket extends EventEmitter {
  // Socket server works with data in JSON-RPC 2.0 format

  private socket: WebSocket.Server = null;
  private clients: { clientId: number, connection: WebSocket }[] = [];

  constructor(private port: number = 3301) { super(); this.initWebSocketServer(); }

  private initWebSocketServer = (): void => {
    if (this.socket !== null) this.disableSocket();

    this.socket = new WebSocket.Server({ port: this.port });
    this.socket.on('connection', this.appendListeners);
    this.socket.on('error', this.initWebSocketServer);
  }

  private appendListeners = (connection: WebSocket): void => {
    connection.on('message', (msg: string): void => {
      const message = JSON.parse(msg);

      if (message.error) return console.log(message.error.description);

      this.emit(message.method, message.response ? message.response : message.params);
    });

    connection.on('unexpected-response', this.connectionBreak);
    connection.on('error', this.connectionBreak);
    connection.on('close', this.connectionBreak);
  }

  private connectionBreak = (connection: WebSocket): void => {
    const clientKey = this.clients.findIndex(v => v.connection === connection);

    this.clients = [
      ...this.clients.slice(0, clientKey),
      ...this.clients.slice(clientKey + 1, this.clients.length),
    ];
  }

  public disableSocket = (): void => {
    this.socket.close();
    this.socket = null;
  }

}
