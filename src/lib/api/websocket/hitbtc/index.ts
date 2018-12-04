import * as WebSocket from 'ws';
import { AbstractSocketEventWrapper } from '../abstract-socket-event-wrapper';
import { exchangesSettings } from '../../../../config';

export interface ITicker {
  ask: string;
  bid: string;
  last: string;
  open: string;
  low: string;
  high: string;
  volume: string;
  volumeQuote: string;
  timestamp: string;
  symbol: string;
}

export class HitBtcSocketHandler extends AbstractSocketEventWrapper {
  public title: string = 'hitbtc';

  constructor() { super(); this.initSocket(); }

  public initSocket(): void {
    // Turn off the socket if was on earlier or if we switch-reset socket from other place
    if (this.socket !== null) this.disableSocket();
    // Get socket url and/or other options
    const { url } = exchangesSettings.hitbtc.socket;

    this.socket = new WebSocket(url);
    this.socket.on('unexpected-response', this.reconnectSocket);
    this.socket.on('open', this.initMessagesHandling);
    this.socket.on('error', this.reconnectSocket);
  }

  private makeRequest(data: { method: string, params: any }): void {
    this.socket.send(JSON.stringify({ ...data, id: (new Date).getTime() }));
  }

  protected initMessagesHandling = (): void => {
    this.socket.on('message', (msg: string) => {
      const message = JSON.parse(msg);

      if (message.error) return console.log(message.error.message, '\n', message.error.description);

      this.emit(message.method, message.response ? message.response : message.params);
    });
  }

  public subscribeTicker(symbol: string) {
    this.makeRequest({ method: 'subscribeTicker', params: { symbol } });
  }

  public unsubscribeTicker(symbol: string) {
    this.makeRequest({ method: 'unsubscribeTicker', params: { symbol } });
  }
}
