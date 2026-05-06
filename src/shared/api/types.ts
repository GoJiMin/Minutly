export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = {
  [key: string]: JsonValue;
};

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type RequestBody = JsonObject | JsonValue[] | null;
export type RequestHeaders = Record<string, string>;
export type RequestQueryParams = Record<string, string | number>;
export type RequestInitWithMethod = Omit<RequestInit, 'method'> & {
  method: RequestMethod;
};

export type FetcherProps = {
  endpoint: string;
  method: RequestMethod;
  headers?: RequestHeaders;
  body?: RequestBody;
  queryParams?: RequestQueryParams;
  withResponse?: boolean;
  cacheOptions?: {cache: RequestCache; next: {revalidate: number}};
};

export type RequestContext = {
  endpoint: string;
  method: RequestMethod;
  requestBody: RequestBody;
  errorHandlingType?: ErrorHandlingType;
};

export type CreateRequestInitProps = {
  body?: RequestBody;
  method: RequestMethod;
  headers?: RequestHeaders;
  cacheOptions?: {cache: RequestCache; next: {revalidate: number}};
};

export type RequestProps = Omit<FetcherProps, 'method'>;

export type RequestPropsWithResponse = RequestProps & {
  withResponse: true;
};

export type RequestPropsWithoutResponse = RequestProps & {
  withResponse?: false;
};

export type ErrorHandlingType = 'toast' | 'errorBoundary' | 'silent';
export type WithErrorHandling<P = unknown> = P & {
  errorHandlingType?: ErrorHandlingType;
};
