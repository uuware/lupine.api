/**
 * A simple settings/config class for storing key/value pairs in memory
 */
import { Db } from '../lib';
import { asyncLocalStorage } from './async-storage';
import { HostToPathProps } from '../models/host-to-path-props';
import { AsyncStorageProps } from '../models';

enum ApiCacheKeys {
  TEMPLATE = 'TEMPLATE',
  DB = 'DB',
  APP_DATA = 'APP_DATA',
  // APP_CACHE = 'APP_CACHE',
}
export class ApiCache {
  private static instance: ApiCache;
  KEYS = ApiCacheKeys;

  private cacheMap: { [key: string]: any } = {};

  private constructor() {}

  public static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }

  clear() {
    Object.keys(this.cacheMap).forEach((key) => {
      delete this.cacheMap[key];
    });
  }

  get(key: string) {
    return this.cacheMap[key];
  }

  set(key: string, value: any) {
    if (typeof value === 'undefined') {
      delete this.cacheMap[key];
    } else {
      this.cacheMap[key] = value;
    }
  }

  // get scope variables inside of asyncLocalStorage.run
  getAsyncStore(): AsyncStorageProps {
    const store = asyncLocalStorage.getStore();
    if (!store) {
      throw new Error('This function should be called inside of asyncLocalStorage.run');
    }

    return store;
  }

  // get scope variables inside of asyncLocalStorage.run
  getAppData() {
    return this.get(ApiCacheKeys.APP_DATA) as HostToPathProps;
  }

  // get scope variables inside of asyncLocalStorage.run
  getAppName() {
    return this.getAsyncStore().appName;
  }

  // get scope variables inside of asyncLocalStorage.run
  getDb() {
    return this.get(ApiCacheKeys.DB) as Db;
  }

  // get scope variables inside of asyncLocalStorage.run
  getUuid() {
    return this.getAsyncStore().uuid;
  }

  // get scope variables inside of asyncLocalStorage.run
  getLang() {
    return this.getAsyncStore().lang;
  }

  clearTemplateCache() {
    this.set(ApiCacheKeys.TEMPLATE, undefined);
  }
}

export const apiCache = ApiCache.getInstance();
