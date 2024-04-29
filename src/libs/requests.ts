import { AxiosRequestConfig } from 'axios';
import { axiosAuth } from './axios';
import { getAccessToken } from '@/utils/localStorage';

const REQUEST_METHODS = {
  GET: 'GET',
  POST: 'POST',
  HEAD: 'HEAD',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const API_URL = process.env.API_BASE_URL;

interface RequestOptions {
  url: string;
  signal?: AbortSignal | null;
  data?: any;
  method?: string;
  baseURL?: string;
  responseType?: string;
  onDownloadProgress?: ((event: ProgressEvent<EventTarget>) => void) | undefined;
  headers?: Record<string, string>;
}

const request = async ({
  url,
  signal,
  data = null,
  method = REQUEST_METHODS.GET,
  baseURL = API_URL,
  responseType = 'json',
  onDownloadProgress,
  headers,
}: RequestOptions): Promise<any> => {
  const response = await axiosAuth({
    method,
    data,
    url,
    baseURL,
    signal,
    responseType,
    onDownloadProgress,
    crossOriginIsolated: true,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
  } as AxiosRequestConfig);
  return response;
};

export const getRequest = async ({ url, baseURL, signal }: RequestOptions): Promise<any> =>
  request({
    url,
    method: REQUEST_METHODS.GET,
    baseURL,
    signal,
  });

export const postRequest = async ({ url, data, baseURL }: RequestOptions): Promise<any> =>
  request({
    url,
    method: REQUEST_METHODS.POST,
    data,
    baseURL,
  });

export const headRequest = async ({ url, baseURL, signal }: RequestOptions): Promise<any> =>
  request({
    url,
    method: REQUEST_METHODS.HEAD,
    baseURL,
    signal,
  });

export const patchRequest = async ({ url, data, baseURL }: RequestOptions): Promise<any> =>
  request({
    url,
    method: REQUEST_METHODS.PATCH,
    data,
    baseURL,
  });

export const putRequest = async ({ url, data, baseURL }: RequestOptions): Promise<any> =>
  request({
    url,
    method: REQUEST_METHODS.PUT,
    data,
    baseURL,
  });

export const streamGetRequest = async ({
  url,
  baseURL,
  onDownloadProgressCallback,
  signal,
}: RequestOptions & { onDownloadProgressCallback: (event: ProgressEvent<EventTarget>) => void }): Promise<any> =>
  request({
    url,
    method: REQUEST_METHODS.GET,
    responseType: 'stream',
    baseURL,
    signal,
    onDownloadProgress: (event) => {
      onDownloadProgressCallback && onDownloadProgressCallback(event);
    },
  });

export const deleteRequest = async ({ url, baseURL }: RequestOptions): Promise<any> => {
  return await request({ url, method: REQUEST_METHODS.DELETE, baseURL });
};
