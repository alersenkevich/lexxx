/**
 *
 * @author Aler Senkevich
 * Abstract API wrapper for rest requests
 *
 */

export interface APIConnectionConfig {
  url: string;
  key: string;
  secret: string;
}

export interface APIRequest {
  action: string;
  method: string;
  access: boolean; // private - true; public - false;
  payload: object;
}

export abstract class AbstractApiWrapper {
  protected config: APIConnectionConfig;
  protected abstract async request <T>(data: APIRequest): Promise<T>;

  protected transformPayloadToString(payload: object): string {
    return Object.entries(payload)
      .map(v => `${v[0]}=${v[1]}`)
      .join('&');
  }

  public get <T>(data: { action: string, payload: object }, access: boolean = false): Promise<T> {
    return this.request<T>({ ...data, access, method: 'GET' });
  }

  public post <T>(data: { action: string, payload: object }, access: boolean = false): Promise<T> {
    return this.request<T>({ ...data, access, method: 'POST' });
  }

  public patch <T>(data: { action: string, payload: object }, access: boolean = false): Promise<T> {
    return this.request<T>({ ...data, access, method: 'PATCH' });
  }

  public put <T>(data: { action: string, payload: object }, access: boolean = false): Promise<T> {
    return this.request<T>({ ...data, access, method: 'PUT' });
  }

  public delete <T>(data: { action: string, payload: object }, access: boolean = false): Promise<T> {
    return this.request<T>({ ...data, access, method: 'DELETE' });
  }
}
