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
 * EXMO API wrapper for rest requests
 *
 */

export interface ITicker {
  [productTitle: string]: {
    buy_price: string;
    sell_price: string;
    last_trade: string;
    high: string;
    low: string;
    avg: string;
    vol: string;
    vol_curr: string;
    updated: number;
  };
}

export interface ISettings {
  [productTitle: string]: {
    min_quantity: string;
    max_quantity: string;
    min_price: string;
    max_price: string;
    max_amount: string;
    min_amount: string;
  };
}

export interface IPublicTrades {
  [productTitle: string]: {
    trade_id: number;
    type: string;
    price: string;
    quantity: string;
    amount: string;
    date: number;
  }[];
}

export interface IOrderBook {
  [productTitle: string]: {
    ask_quantity: string;
    ask_amount: string;
    ask_top: string;
    bid_quantity: string;
    bid_amount: string;
    bid_top: string;
    ask: number[][];
    bid: number[][];
  };
}

export interface IUserInfo {
  uid: number;
  server_date: number;
  balances: {
    [currencyName: string]: string;
  };
  reserved: {
    [currencyName: string]: string;
  };
}

export interface IOrderCreated {
  result: boolean;
  error: string;
  order_id: number;
}

export interface IOrderCancelled {
  result: boolean;
  error: string;
}

export interface IOpenOrders {
  [productTitle: string]: {
    order_id: string;
    created: string;
    type: string;
    pair: string;
    price: string;
    quantity: string;
    amount: string;
  }[];
}

export interface IUserTrades {
  [productTitle: string]: {
    trade_id: number;
    date: number;
    type: string;
    pair: string;
    order_id: number;
    quantity: number;
    price: number;
    amount: number;
  }[];
}

export interface ICancelledOrder {
  date: number;
  order_id: number;
  order_type: string;
  pair: string;
  price: number;
  quantity: number;
  amount: number;
}

export interface IOrderTrades {
  type: string;
  in_currency: string;
  in_amount: string;
  out_currency: string;
  out_amount: string;
  trades: {
    trade_id: number;
    date: number;
    type: string;
    pair: string;
    order_id: number;
    quantity: number;
    price: number;
    amount: number;
  }[];
}

export interface IDepositAddresses {
  [currencyTitle: string]: string;
}

export interface IWithdrawResult {
  result: boolean;
  error: string;
  task_id: string;
}

export interface IWithdrawTxid {
  result: boolean;
  error: string;
  status: boolean;
  txid: string;
}

export interface ICandles {
  close: number;
  datetime: string;
}

export class ExmoApiWrapper extends AbstractApiWrapper {
  constructor(protected config: APIConnectionConfig) {
    super();
  }

  // Public API
  public async getTicker(): Promise<ITicker> {
    return await this.get<ITicker>({ action: 'ticker', payload: {} });
  }

  public async getSettings(): Promise<ISettings> {
    return await this.get<ISettings>({ action: 'pair_settings', payload: {} });
  }

  public async getPublicTrades(params: { pair: string }): Promise<IPublicTrades> {
    return await this.get<IPublicTrades>({ action: 'trades', payload: { ...params } });
  }

  public async getOrderBook(params: { pair: string, limit?: number }): Promise<IOrderBook> {
    return await this.get<IOrderBook>({ action: 'order_book', payload: { ...params } });
  }

  public async getCurrencies(): Promise<string[]> {
    return await this.get<string[]>({ action: 'currency', payload: {} });
  }

  // Authenticated API
  public async getUserInfo(): Promise<IUserInfo> {
    return await this.post<IUserInfo>({ action: 'user_info', payload: {} }, true);
  }

  public async createOrder(params: { pair: string, quantity: number, price: number, type: string }): Promise<IOrderCreated> {
    return await this.post<IOrderCreated>({ action: 'order_create', payload: { ...params } }, true);
  }

  public async cancelOrder(params: { order_id: number }): Promise<IOrderCancelled> {
    return await this.post<IOrderCancelled>({ action: 'order_cancel', payload: { ...params } }, true);
  }

  public async getUserOpenOrders(): Promise<IOpenOrders> {
    return await this.post<IOpenOrders>({ action: 'user_open_orders', payload: {} }, true);
  }

  public async getUserTrades(params: { pair: string, offset?: number, limit?: number; }): Promise<IUserTrades> {
    return await this.post<IUserTrades>({ action: 'user_trades', payload: { ...params } }, true);
  }

  public async getUserCancelledOrders(params: { offset?: number, limit?: number }): Promise<ICancelledOrder[]> {
    return await this.post<ICancelledOrder[]>({ action: 'user_cancelled_orders', payload: { ...params } }, true);
  }

  public async getOrderTrades(params: { order_id?: number }): Promise<IOrderTrades> {
    return await this.post<IOrderTrades>({ action: 'order_trades', payload: { ...params } }, true);
  }

  public async getDepositAddresses(): Promise<IDepositAddresses> {
    return await this.post<IDepositAddresses>({ action: 'deposit_address', payload: {} }, true);
  }

  public async withdrawCrypto(params: { amount: number, currency: string, address: string, invoice?: string }): Promise<IWithdrawResult> {
    return await this.post<IWithdrawResult>({ action: 'withdraw_crypt', payload: {} }, true);
  }

  public async withdrawGetTxid(params: { task_id: string }): Promise<IWithdrawTxid> {
    return await this.post<IWithdrawTxid>({ action: 'withdraw_get_txid', payload: {} }, true);
  }

  private makeSign(payloadString: string): string {
    return crypto
      .createHmac('sha512', this.config.secret)
      .update(payloadString)
      .digest('hex');
  }

  protected async request<T>(data: APIRequest): Promise<T> {
    try {
      const { method, access, action, payload } = data;

      const body: string = this.transformPayloadToString({
        ...payload,
        nonce: (new Date).getTime(),
      });

      const url: string = `${this.config.url}/${action}${data.method === 'GET' ? `?${body}` : ''}`;
      const sign: string = this.makeSign(body);

      const headers = {
        Key: access ? this.config.key : undefined,
        Sign: access ? sign : undefined,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      let requestObject: object = { method, headers };

      if (method !== 'GET') {
        requestObject = {
          ...requestObject, body,
        };
      }

      const response = await nodeFetch(
        url, requestObject,
      );

      const responseObject = await response.json();

      return responseObject;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export const apiInit = (config: APIConnectionConfig) => new ExmoApiWrapper(config);
