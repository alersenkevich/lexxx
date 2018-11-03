import * as crypto from 'crypto';
import nodeFetch from 'node-fetch';
import {
  APIRequest,
  AbstractApiWrapper,
  APIConnectionConfig,
} from '../abstract-api-wrapper';

/**
 *
 * @author Aler Senkevich
 * Bittrex API wrapper for rest requests
 *
 */

export interface ITicker {
  success: boolean;
  message: string;
  result: {
    Bid: number;
    Ask: number;
    Last: number;
  };
}

export interface IMarkets {
  success: boolean;
  message: string;
  result: {
    MarketCurrency: string;
    BaseCurrency: string;
    MarketCurrencyLong: string;
    BaseCurrencyLong: string;
    MinTradeSize: number;
    MarketName: string;
    IsActive: boolean;
    Created: string;
  }[];
}

export interface ICurrencies {
  success: boolean;
  message: string;
  result: {
    Currency: string;
    CurrencyLong: string;
    MinConfirmation: number;
    TxFee: number;
    IsActive: true,
    CoinType: string;
    BaseAddress: null;
  }[];
}

export interface IMarketSummaries {
  success: boolean;
  message: string;
  result: {
    MarketName: string;
    High: number;
    Low: number;
    Volume: number;
    Last: number;
    BaseVolume: number;
    TimeStamp: string;
    Bid: number;
    Ask: number;
    OpenBuyOrders: number;
    OpenSellOrders: number;
    PrevDay: number;
    Created: string;
    DisplayMarketName: null;
  }[];
}

export interface IOrderBook {
  success: boolean;
  message: string;
  result: {
    buy: {
      Quantity: number;
      Rate: number;
    }[];
    sell: {
      Quantity: number;
      Rate: number;
    }[];
  }[];
}

export interface IMarketHistory {
  success: boolean;
  message: string;
  result: {
    Id: number;
    TimeStamp: string;
    Quantity: number;
    Price: number;
    Total: number;
    FillType: string;
    OrderType: string;
  }[];
}

export interface IOrderPlaced {
  success: boolean;
  message: string;
  result: {
    uuid: string;
  };
}

export interface IOrderCancelled {
  success: boolean;
  message: string;
  result: null;
}

export interface IOpenOrders {
  success: boolean;
  message: string;
  result: {
    Uuid: null;
    OrderUuid: string;
    Exchange: string;
    OrderType: string;
    Quantity: number;
    QuantityRemaining: number;
    Limit: number;
    CommissionPaid: number;
    Price: number;
    PricePerUnit: null;
    Opened: string;
    Closed: null;
    CancelInitiated: boolean;
    ImmediateOrCancel: boolean;
    IsConditional: boolean;
    Condition: null;
    ConditionTarget: null;
  }[];
}

export interface IBalances {
  success: boolean;
  message: string;
  result: {
    Currency: string;
    Balance: number;
    Available: number;
    Pending: number;
    CryptoAddress: string;
    Requested: boolean;
    Uuid: null;
  }[];
}

export interface IBalance {
  success: boolean;
  message: string;
  result: {
    Currency: string;
    Balance: number;
    Available: number;
    Pending: number;
    CryptoAddress: string;
    Requested: boolean;
    Uuid: null;
  };
}

export interface IDepositAddress {
  success: boolean;
  message: string;
  result: {
    Currency: string;
    Address: string;
  };
}

export interface IWithdrawResult {
  success: boolean;
  message: string;
  result: {
    uuid: string;
  };
}

export interface IOrder {
  success: boolean;
  message: string;
  result: {
    AccountId: null;
    OrderUuid: string;
    Exchange: string;
    Type: string;
    Quantity: number;
    QuantityRemaining: number;
    Limit: number;
    Reserved: number;
    ReserveRemaining: number;
    CommissionReserved: number;
    CommissionReserveRemaining: number;
    CommissionPaid: number;
    Price: number;
    PricePerUnit: null;
    Opened: string;
    Closed: null;
    IsOpen: boolean;
    Sentinel: string;
    CancelInitiated: boolean;
    ImmediateOrCancel: boolean;
    IsConditional: boolean;
    Condition: string;
    ConditionTarget: null;
  };
}

export interface IOrderHistory {
  success: boolean;
  message: string;
  result: {
    OrderUuid: string;
    Exchange: string;
    TimeStamp: string;
    OrderType: string;
    Limit: number;
    Quantity: number;
    QuantityRemaining: number;
    Commission: number;
    Price: number;
    PricePerUnit: null,
    IsConditional: boolean;
    Condition: null,
    ConditionTarget: null,
    ImmediateOrCancel: boolean;
  }[];
}

export interface IWithdrawalHistory {
  success: boolean;
  message: string;
  result: {
    PaymentUuid: string;
    Currency: string;
    Amount: number;
    Address: string;
    Opened: string;
    Authorized: true,
    PendingPayment: boolean;
    TxCost: number;
    TxId: null,
    Canceled: boolean;
    InvalidAddress: boolean;
  }[];
}

export interface IDepositHistory {
  success: boolean;
  message: string;
  result: {
    PaymentUuid: string;
    Currency: string;
    Amount: number;
    Address: string;
    Opened: string;
    Authorized: true,
    PendingPayment: boolean;
    TxCost: number;
    TxId: string;
    Canceled: boolean;
    InvalidAddress: boolean;
  }[];
}

export interface ICandle {
  MarketName: string;
  High: number;
  Low: number;
  Volume: number;
  Last: number;
  BaseVolume: number;
  TimeStamp: string;
  Bid: number;
  Ask: number;
  OpenBuyOrders: number;
  OpenSellOrders: number;
  PrevDay: number;
  Created: string;
  DisplayMarketName: null;
}

export class BittrexApiWrapper extends AbstractApiWrapper {
  constructor(protected config: APIConnectionConfig) {
    super();
  }

  // Public API
  public async getTicker(params: { market: string }): Promise<ITicker> {
    return await this.get<ITicker>({ action: 'public/getticker', payload: { ...params } });
  }

  public async getMarkets(): Promise<IMarkets> {
    return await this.get<IMarkets>({ action: 'public/getmarkets', payload: {} });
  }

  public async getCurrencies(): Promise<ICurrencies> {
    return await this.get<ICurrencies>({ action: 'public/getcurrencies', payload: {} });
  }

  public async getMarketSummaries(): Promise<IMarketSummaries> {
    return await this.get<IMarketSummaries>({ action: 'public/getmarketsummaries', payload: {} });
  }

  public async getMarketSummary(params: { market: string }): Promise<IMarketSummaries> {
    return await this.get<IMarketSummaries>({ action: 'public/getmarketsummary', payload: {} });
  }

  public async getOrderBook(): Promise<IOrderBook> {
    return await this.get<IOrderBook>({ action: 'public/getorderbook', payload: {} });
  }

  public async getMarketHistory(): Promise<IMarketHistory> {
    return await this.get<IMarketHistory>({ action: 'public/getmarkethistory', payload: {} });
  }

  // Market API
  public async cancelOrder(params: { uuid: string }): Promise<IOrderCancelled> {
    return await this.get<IOrderCancelled>({ action: 'market/cancel', payload: { ...params } });
  }

  public async getOpenOrders(params: { market?: string }): Promise<IOpenOrders> {
    return await this.get<IOpenOrders>({ action: 'market/getopenorders', payload: { ...params } });
  }

  public async buyLimit(params: {
    market: string,
    quantity: number,
    rate: number,
  }): Promise<IOrderPlaced> {
    return await this.get<IOrderPlaced>({ action: 'market/buylimit', payload: { ...params } });
  }

  public async selllimit(params: {
    market: string,
    quantity: number,
    rate: number,
  }): Promise<IOrderPlaced> {
    return await this.get<IOrderPlaced>({ action: 'market/selllimit', payload: { ...params } });
  }

  // Account API
  public async getBalances(): Promise<IBalances> {
    return await this.get<IBalances>({ action: 'account/getbalances', payload: {} }, true);
  }

  public async getBalance(params: { currency: string }): Promise<IBalance> {
    return await this.get<IBalance>({ action: 'account/getbalance', payload: { ...params } }, true);
  }

  public async getDepositAddress(params: { currency: string }): Promise<IDepositAddress> {
    return await this.get<IDepositAddress>({ action: 'account/getdepositaddress', payload: { ...params } }, true);
  }

  public async getOrder(params: { uuid: string }): Promise<IOrder> {
    return await this.get<IOrder>({ action: 'account/getorder', payload: { ...params } }, true);
  }

  public async getOrderHistory(params: { market?: string }): Promise<IOrderHistory> {
    return await this.get<IOrderHistory>({ action: 'account/getorderhistory', payload: { ...params } }, true);
  }

  public async getWithdrawalHistory(params: { currency?: string; }): Promise<IWithdrawalHistory> {
    return await this.get<IWithdrawalHistory>({ action: 'account/getwithdrawalhistory', payload: { ...params } }, true);
  }

  public async getDepositHistory(params: { currency?: string }): Promise<IDepositHistory> {
    return await this.get<IDepositHistory>({ action: 'account/getdeposithistory', payload: { ...params } }, true);
  }

  public async withdraw(params: {
    currency: string;
    quantity: number;
    address: string;
    payment?: string;
  }): Promise<IWithdrawResult> {
    return await this.get<IWithdrawResult>({ action: 'account/withdraw', payload: {} }, true);
  }

  protected async request <T>(data: APIRequest): Promise<T> {
    try {
      const { method, access, action, payload } = data;
      const body = this.transformPayloadToString(
        access
          ? { ...payload, apikey: this.config.key, nonce: (new Date).getTime() }
          : payload,
      );

      const url = `${this.config.url}/${action}${data.method === 'GET' ? `?${body}` : ''}`;
      const sign = this.makeSign(url);
      const response = await nodeFetch(url, { headers: { apisign: access ? sign : undefined } });
      const responseObject = await response.json();

      return responseObject;
    } catch (error) {
      console.log(error);
    }
  }

  private makeSign(payloadString: string): string {
    return crypto
      .createHmac('sha512', this.config.secret)
      .update(payloadString)
      .digest('hex');
  }
}

export const apiInit = (config: APIConnectionConfig) => new BittrexApiWrapper(config);