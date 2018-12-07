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

      this.emit(message.method, message.result ? message.result : message.params);
    });

    connection.on('unexpected-response', this.disableConnection);
    connection.on('error', this.disableConnection);
    connection.on('close', this.disableConnection);
  }

  private disableConnection = (connection: WebSocket): void => {
    const clientKey = this.clients.findIndex(v => v.connection === connection);

    this.clients = [
      ...this.clients.slice(0, clientKey),
      ...this.clients.slice(clientKey + 1, this.clients.length),
    ];
  }

  private prepareMessage = (method: string, message: any): string => JSON.stringify({
    method, params: message, id: (new Date).getTime(),
  })

  public broadcast = (method: string, message: any): Promise<void[]> => Promise.all(
    this.clients.map(
      ({ connection }) => connection.readyState === WebSocket.OPEN
        ? connection.send(this.prepareMessage(method, message))
        : (() => {})(),
    ),
  )

  public notifyClient = (method: string, message: any, clientId: number): void => {
    if (this.clients.length) {
      const clientConnections = this.clients.filter(v => v !== undefined && v.clientId === clientId);

      if (clientConnections.length) {
        Promise.all(clientConnections.map(v => v !== undefined
          && v.connection.readyState === WebSocket.OPEN
            ? v.connection.send(JSON.stringify(message))
            : (() => {})(),
        ));
      }
    }
  }

  public disableSocket = (): void => {
    this.socket.close();
    this.socket = null;
  }

}
