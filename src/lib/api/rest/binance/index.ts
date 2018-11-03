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
 * Binance API wrapper for rest requests
 *
 */

export interface IOrderResult {
  symbol: string;
  orderId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
}

interface ICreateOrder {
  symbol: string;
  side: string;
  type: string;
  quantity: string;
  price?: number;
}

export interface ICanceledOrder {
  symbol: string;
  origClientOrderId: string;
  orderId: number;
  clientOrderId: string;
}

interface IPriceFilter {
  filterType: string;
  minPrice: string;
  maxPrice: string;
  tickSize: string;
}

interface ILotSizeFilter {
  filterType: string;
  minQty: string;
  maxQty: string;
  stepSize: string;
}

interface IMinNotionalFilter {
  filterType: string;
  minNotional: string;
}

export interface IBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface IAccount {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  balances: IBalance[];
}

export interface IExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: object[];
  exchangeFilters: [];
  symbols: ISymbol[];
}

export interface ISymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  orderTypes: string[];
  icebergAllowed: boolean;
  filters: [
    IPriceFilter,
    ILotSizeFilter,
    IMinNotionalFilter
  ];
}

export interface ITicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  fristId: number;  // First tradeId
  lastId: number;   // Last tradeId
  count: number;    // Trade count
}

export interface ITrade {
  id: number;
  orderId: number;
  price: string;
  qty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  isBestMatch: boolean;
}

export interface IWithdrawResult {
  msg: string;
  success: boolean;
  id: string;
}

export interface IDepositHistory {
  success: boolean;
  depositList: {
    insertTime: number;
    amount: number;
    asset: string;
    address: string;
    txId: string;
    status: number;
  }[];
}

export interface IWithdrawHistory {
  success: boolean;
  withdrawList: {
    id: string;
    amount: number;
    address: string;
    asset: string;
    txId: string;
    applyTime: number;
    status: number;
  }[];
}


export class BinanceApiWrapper extends AbstractApiWrapper {
  constructor(protected config: APIConnectionConfig) {
    super();
  }

  public async getProducts(): Promise<IExchangeInfo> {
    return await this.get<IExchangeInfo>({ action: 'api/v1/exchangeInfo', payload: {} });
  }

  public async getTicker(): Promise<ITicker[]> {
    return await this.get<ITicker[]>({ action: 'api/v1/ticker/24hr', payload: {} });
  }

  public async getTickerBySymbol(symbol: string): Promise<ITicker> {
    return await this.get<ITicker>({ action: 'api/v1/ticker/24hr', payload: { symbol } });
  }

  public async getAccountInfo(): Promise<IAccount> {
    return await this.get<IAccount>({ action: 'api/v3/account', payload: {} }, true);
  }

  public async getCandles(params: { symbol: string, interval: string, limit?: number }): Promise<[
    number, string, string, string, string, string,
    number, string, number, string, string, string
  ][]> {
    return await this.get<[
      number, string, string, string, string, string,
      number, string, number, string, string, string
    ][]>({
      action: 'api/v1/klines',
      payload: params,
    });
  }

  public async getMyTrades(options: { symbol: string, limit?: number, fromId?: number }): Promise<ITrade[]> {
    return await this.get<ITrade[]>({ action: 'api/v3/myTrades', payload: { ...options } }, true);
  }

  public async makeOrder(order: ICreateOrder): Promise<IOrderResult> {
    return await this.post<IOrderResult>({
      action: 'api/v3/order',
      payload: {
        ...order,
      },
    }, true);
  }

  public async getOrder(orderId: number, symbol: string): Promise<IOrderResult> {
    return await this.get<IOrderResult>({ action: 'api/v3/order', payload: { orderId, symbol } }, true);
  }

  public async cancelOrder(orderId: number, symbol: string): Promise<ICanceledOrder> {
    return await this.delete<ICanceledOrder>({ action: 'api/v3/order', payload: { orderId, symbol } }, true);
  }

  // WAPI
  public async withdraw(params: { asset: string, address: string, amount: number }): Promise<IWithdrawResult> {
    return await this.post<IWithdrawResult>({ action: 'wapi/v3/withdraw.html', payload: { ...params } }, true);
  }

  public async getDepositHistory(params: { asset?: string, status?: number }): Promise<IDepositHistory> {
    return await this.get<IDepositHistory>({ action: 'wapi/v3/depositHistory.html', payload: {} }, true);
  }

  public async getWithdrawHistory(params: { asset?: string, status?: number }): Promise<IWithdrawHistory> {
    return await this.get<IWithdrawHistory>({ action: 'wapi/v3/withdrawHistory.html', payload: { ...params } }, true);
  }

  public async getWithdrawFee(params: { asset: string }): Promise<{ withdrawFee: string, success: boolean }[]> {
    return await this.get<{ withdrawFee: string, success: boolean }[]>({ action: 'wapi/v3/withdrawFee', payload: { ...params } }, true);
  }


  protected async request <T>(data: APIRequest): Promise<T> {
    try {
      const { method, access, payload, action } = data;
      const body: string = this.transformPayloadToString(
        access
          ? {
            ...payload,
            timestamp: (new Date).getTime(),
            recvWindow: 10000000,
          }
          : payload,
      );
      const url: string = `${this.config.url}/${action}${data.method === 'GET' ? `?${body}` : ''}`;
      const sign: string = this.makeSign(body);
      const headers = {
        'X-MBX-APIKEY': access ? this.config.key : undefined,
      };
      let requestObject: object = { method, headers, timeout: 10000000 };

      if (method !== 'GET') {
        requestObject = {
          ...requestObject, body: `${body}&signature=${sign}`,
        };
      }

      const response = await nodeFetch(
        `${url}${ (access && method === 'GET') ? `&signature=${sign}` : ''}`,
        requestObject,
      );

      const responseObject = await response.json();


      return responseObject;

    } catch (error) {
      console.log(error);
    }
  }

  private makeSign(payloadString: string): string {
    return crypto
      .createHmac('sha256', this.config.secret)
      .update(payloadString)
      .digest('hex');
  }

}

export const apiInit = (config: APIConnectionConfig) => new BinanceApiWrapper(config);
