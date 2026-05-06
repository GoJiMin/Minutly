import {createRequestError, type ErrorResponse, parseErrorResponse} from './error';
import {
  CreateRequestInitProps,
  FetcherProps,
  RequestContext,
  RequestInitWithMethod,
  RequestProps,
  RequestPropsWithoutResponse,
  RequestPropsWithResponse,
  RequestQueryParams,
  WithErrorHandling,
} from './types';

function createRequestInit({method, body, headers, cacheOptions}: CreateRequestInitProps) {
  const requestInit: RequestInitWithMethod = {
    credentials: 'include',
    method,
    headers,
    ...cacheOptions,
  };

  if (body !== undefined && body !== null) {
    return {
      ...requestInit,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };
  }

  return requestInit;
}

function createQueryString(queryParams?: RequestQueryParams) {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return '';
  }

  return new URLSearchParams(Object.entries(queryParams).map(([key, value]) => [key, String(value)])).toString();
}

function prepareRequest({endpoint, method, headers, body, queryParams, cacheOptions}: FetcherProps) {
  let url = endpoint;
  const queryString = createQueryString(queryParams);

  if (queryString) {
    url += `?${queryString}`;
  }

  const requestInit = createRequestInit({method, body, headers, cacheOptions});

  return {url, requestInit};
}

const NETWORK_ERROR_RESPONSE: ErrorResponse = {
  title: 'NETWORK_ERROR',
  detail: '네트워크 연결을 확인해주세요.',
  status: 503,
};

type FetchResult = {ok: true; response: Response} | {ok: false; errorResponse: ErrorResponse};

async function request(url: string, requestInit: RequestInitWithMethod): Promise<FetchResult> {
  try {
    const response = await fetch(url, requestInit);

    return {ok: true, response};
  } catch {
    return {
      ok: false,
      errorResponse: NETWORK_ERROR_RESPONSE,
    };
  }
}

async function parseJsonResponse<T>(response: Response, context: RequestContext): Promise<T> {
  if (response.status === 204) {
    throw createRequestError({
      errorResponse: {
        title: 'EMPTY_RESPONSE',
        detail: '서버 응답 본문이 비어 있어요.',
        status: 500,
      },
      context,
    });
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw createRequestError({
      errorResponse: {
        title: 'INVALID_JSON_RESPONSE',
        detail: '서버 응답을 JSON으로 해석할 수 없어요.',
        status: 500,
      },
      context,
    });
  }
}

type TokenRefreshResult = {ok: true} | {ok: false; errorResponse: ErrorResponse};

// Share one in-flight refresh request across concurrent TOKEN_EXPIRED responses.
let refreshPromise: Promise<TokenRefreshResult> | null = null;

async function requestTokenRefresh(): Promise<TokenRefreshResult> {
  const refreshResult = await request('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });

  if (!refreshResult.ok) {
    return refreshResult;
  }

  const {response: refreshResponse} = refreshResult;

  if (!refreshResponse.ok) {
    const refreshErrorResponse = await parseErrorResponse(refreshResponse);

    return {
      ok: false,
      errorResponse: refreshErrorResponse,
    };
  }

  return {ok: true};
}

async function refreshAccessTokenOnce(): Promise<TokenRefreshResult> {
  if (!refreshPromise) {
    const promise = requestTokenRefresh();

    refreshPromise = promise;

    try {
      return await promise;
    } finally {
      if (refreshPromise === promise) {
        refreshPromise = null;
      }
    }
  }

  return await refreshPromise;
}

async function fetcher<T>(props: WithErrorHandling<FetcherProps>): Promise<T> {
  const {url, requestInit} = prepareRequest(props);

  const context: RequestContext = {
    endpoint: url,
    method: props.method,
    requestBody: props.body ?? null,
    errorHandlingType: props.errorHandlingType,
  };

  const requestResult = await request(url, requestInit);

  if (!requestResult.ok) {
    throw createRequestError({errorResponse: requestResult.errorResponse, context});
  }

  let {response} = requestResult;

  if (!response.ok) {
    const errorResponse = await parseErrorResponse(response);

    if (errorResponse.title === 'TOKEN_EXPIRED') {
      const refreshResult = await refreshAccessTokenOnce();

      if (!refreshResult.ok) {
        throw createRequestError({errorResponse: refreshResult.errorResponse, context});
      }

      const retryResult = await request(url, requestInit);

      if (!retryResult.ok) {
        throw createRequestError({errorResponse: retryResult.errorResponse, context});
      }

      response = retryResult.response;

      if (!response.ok) {
        const retryErrorResponse = await parseErrorResponse(response);
        throw createRequestError({errorResponse: retryErrorResponse, context});
      }
    } else {
      throw createRequestError({errorResponse, context});
    }
  }

  if (props.withResponse) {
    return await parseJsonResponse(response, context);
  }

  return undefined as T;
}

export function fetchGet<T>(
  props: WithErrorHandling<Omit<RequestPropsWithResponse, 'withResponse'> & {withResponse?: true}>,
): Promise<T>;
export function fetchGet(props: WithErrorHandling<RequestPropsWithoutResponse>): Promise<void>;
export async function fetchGet<T>({
  withResponse = true,
  errorHandlingType = 'errorBoundary',
  ...args
}: WithErrorHandling<RequestProps>): Promise<T> {
  return fetcher<T>({
    ...args,
    method: 'GET',
    withResponse,
    errorHandlingType,
  });
}

export function fetchPost<T>(props: RequestPropsWithResponse): Promise<T>;
export function fetchPost(props: RequestPropsWithoutResponse): Promise<void>;
export async function fetchPost<T>({withResponse = false, ...args}: RequestProps): Promise<T | void> {
  return fetcher<T>({
    ...args,
    method: 'POST',
    withResponse,
  });
}

export function fetchPut<T>(props: RequestPropsWithResponse): Promise<T>;
export function fetchPut(props: RequestPropsWithoutResponse): Promise<void>;
export async function fetchPut<T>({withResponse = false, ...args}: RequestProps): Promise<T | void> {
  return fetcher<T>({
    ...args,
    method: 'PUT',
    withResponse,
  });
}

export function fetchDelete<T>(props: RequestPropsWithResponse): Promise<T>;
export function fetchDelete(props: RequestPropsWithoutResponse): Promise<void>;
export async function fetchDelete<T>({withResponse = false, ...args}: RequestProps): Promise<T | void> {
  return fetcher<T>({
    ...args,
    method: 'DELETE',
    withResponse,
  });
}
