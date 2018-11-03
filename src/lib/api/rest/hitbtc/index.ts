import * as crypto from 'crypto';
import nodeFetch from 'node-fetch';
import {
  AbstractApiWrapper,
  APIConnectionConfig,
  APIRequest,
} from '../abstract-api-wrapper';

/**
 *
 * @author Aler Senkevich
 * HitBtc API wrapper for rest requests
 *
 */

export interface ICandle {
  timestamp: string;
  open: string;
  close: string;
  min: string;
  max: string;
  volume: string;
  volumeQuote: string;
}

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

export interface ISymbol {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  quantityIncrement: string;
  tickSize: string;
  takeLiquidityRate: string;
  provideLiquidityRate: string;
  feeCurrency: string;
}

export interface ITradingBalance {
  currency: string;
  available: string;
  reserved: string;
}

export interface IOrder {
  id?: string;
  clientOrderId: string;
  orderId?: string | number;
  symbol: string;
  side: string;
  status: string;
  type: string;
  timeInForce?: string;
  quantity: string | number;
  price: string | number;
  cumQuantity?: string;
  createdAt?: string;
  updatedAt?: string;
  fee?: string;
}

export interface ICreateOrder {
  symbol: string;
  side: string;
  quantity: string;
  price?: string;
  type: string;
}

export interface ITrade {
  id: number;
  clientOrderId: string;
  orderId: number;
  symbol: string;
  side: string;
  quantity: string;
  price: string;
  fee: string;
  timestamp: string;
}

export interface ITradesHistoryInput {
  symbol?: string;
  sort?: string; // DESC or ASK. Default value desc
  by?: string; // timestamp by default, or id
  from?: string;
  till?: string;
  limit?: number; // default 100;
  offset?: number;
}

export interface IDepositAddress {
  address: string;
  paymentId: string;
}

export interface ITransaction {
  id: string;
  index: number;
  currency: string;
  amount: string;
  fee: string;
  networkFee: string;
  address: string;
  hash: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface IApiError {
  error: {
    code: number;
    message: string;
    description: string;
  };
}

export interface IHelp {
  helper: boolean;
}

export class HitBtcApiWrapper extends AbstractApiWrapper {
  constructor(protected config: APIConnectionConfig) {
    super();
  }

  // Public market data
  public async getTicker(): Promise<ITicker[]> {
    return await this.get<ITicker[]>({ action: 'public/ticker', payload: {} });
  }

  public async getTickerBySymbol(symbol: string): Promise<ITicker> {
    return await this.get<ITicker>({ action: `public/ticker/${symbol}`, payload: {} });
  }

  public async getSymbol(symbol: string = ''): Promise<ISymbol[] | ISymbol> {
    return await this.get<ISymbol[] | ISymbol>({ action: `public/symbol${symbol !== '' ? `/${symbol}` : ''}`, payload: {} });
  }

  // Account & Trading data
  public async transferMoney(currency: string, amount: string, type: string = 'exchangeToBank'): Promise<{ id: string }> {
    return await this.post<{ id: string }>({ action: 'account/transfer', payload: { currency, amount, type } }, true);
  }

  public async getTradingBalance(): Promise<ITradingBalance[]> {
    return await this.get<ITradingBalance[]>({ action: 'trading/balance', payload: {} }, true);
  }

  public async getAccountBalance(): Promise<{ currency: string, available: string, reserved: string }[]> {
    return await this.get<{ currency: string, available: string, reserved: string }[]>({ action: 'account/balance', payload: {} }, true);
  }

  public async getActiveOrders(): Promise<IOrder[]> {
    return await this.get<IOrder[]>({ action: 'order', payload: {} }, true);
  }

  public async getActiveOrderByClientId(orderId: string): Promise<IOrder> {
    return await this.get<IOrder>({ action: `order/${orderId}`, payload: {} }, true);
  }

  public async makeOrder(order: ICreateOrder): Promise<IOrder> {
    return await this.post<IOrder>({ action: 'order', payload: { ...order, strictValidate: true } }, true);
  }

  public async cancelOrders(symbol: string = ''): Promise<IOrder[]> {
    const payload = symbol !== '' ? {
      symbol,
    } : {};

    return await this.delete<IOrder[]>({ payload, action: 'order' }, true);
  }

  public async cancelOrderByClientOrderId(orderId: string = ''): Promise<IOrder> {
    return await this.delete<IOrder>({ action: `order/${orderId}`, payload: {} }, true);
  }

  public async getOrdersHistory(symbol: string): Promise<IOrder[]> {
    return await this.get<IOrder[]>({ action: 'history/order', payload: { symbol } }, true);
  }

  public async getFilledOrder(clientOrderId: string): Promise<IOrder> {
    return await this.get<IOrder>({ action: 'history/order', payload: { clientOrderId } }, true);
  }

  public async getTradesHistory(params: ITradesHistoryInput): Promise<ITrade[]> {
    return await this.get<ITrade[]>({ action: 'history/trades', payload: { ...params, sort: 'DESC' } }, true);
  }

  public async getCandles(symbol: string, period: string): Promise<ICandle[]> {
    return await this.get<ICandle[]>({ action: `public/candles/${symbol}`, payload: { period } });
  }

  public async getDepositAddress(currency: string): Promise<IDepositAddress> {
    return await this.get<IDepositAddress>({ action: `account/crypto/address/${currency}`, payload: {} }, true);
  }

  public async getTransactionsHistory(params: { currency: string, sort?: string, by?: string, limit?: number }): Promise<ITransaction[]> {
    return await this.get<ITransaction[]>({ action: 'account/transactions', payload: { ...params } }, true);
  }

  public async withdraw(params: {
    currency: string,
    amount: number,
    address: string,
    paymentId?: string,
    networkFee: string | number,
  }): Promise<{ id: string }> {
    return await this.post<{ id: string }>({ action: 'account/crypto/withdraw', payload: {} }, true);
  }

  protected async request <T>(data: APIRequest): Promise<T> {
    try {
      const { method, access, payload, action } = data;
      const body: string = this.transformPayloadToString(payload);

      const authParams = this.transformPayloadToString({
        apiKey: this.config.key,
        nonce: Date.now(),
      });

      const queryString = method === 'GET'
        ? `${authParams}&${body}`
        : authParams;

      const url: string = `${this.config.url}/${action}?${queryString}`;
      const sign: string = this.makeSign(`${authParams}&${body}`);
      const auth = `Basic ${
        Buffer.from(`${this.config.key}:${this.config.secret}`).toString('base64')
      }`;

      const headers = {
        accept: 'application/json',
        Authorization: auth,
        'X-Signature': access ? sign : undefined,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      let requestObject: any = { method, headers, timeout: 10000000 };

      if (method !== 'GET') requestObject = { ...requestObject, body };

      const response = await nodeFetch(url, requestObject);
      const responseObject = await response.json();

      return responseObject;
    } catch (error) {
      console.log(error);
    }
  }

  private makeSign(payloadString: string) : string {
    return crypto
      .createHmac('sha512', this.config.secret)
      .update(payloadString)
      .digest('hex');
  }
}

export const apiInit = (config: APIConnectionConfig) => new HitBtcApiWrapper(config);
