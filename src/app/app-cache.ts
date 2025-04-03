/**
 * A simple settings/config class for storing key/value pairs in memory
 */
enum AppCacheKeys {
  APP_LIST = 'APP_LIST', // all app names list
  TEMPLATE = 'TEMPLATE',
  APP_DATA = 'APP_DATA',
  APP_DEBUG = 'APP_DEBUG',
  NODE_ENV = 'NODE_ENV',
  API_MODULE = 'API_MODULE',
  API_CONFIG = 'API_CONFIG',
  RENDER_PAGE_FUNCTIONS = 'RENDER_PAGE_FUNCTIONS',

  START_TIME = 'START_TIME',
  APP_VERSION = 'APP_VERSION',
}

// Note: since api and app are independent, when accessing from api, AppCache data will be empty!
export class AppCache {
  private static instance: AppCache;

  KEYS = AppCacheKeys;
  APP_GLOBAL = 'APP_GLOBAL';
  cacheMap: { [key: string]: any } = {};

  private constructor() {}

  public static getInstance(): AppCache {
    if (!AppCache.instance) {
      AppCache.instance = new AppCache();

      // const _lupineApi = (globalThis as any)._lupineApi = (globalThis as any)._lupineApi || {};
      // _lupineApi['appCache'] = AppCache.instance;
    }
    return AppCache.instance;
  }
  public static replaceInstance(appCacheFromApp: AppCache) {
    // At this time, AppCache.getInstance() has already been exported, so we can only replace cacheMap
    AppCache.instance.cacheMap = appCacheFromApp.cacheMap;
  }

  clear(appName: string | undefined) {
    const preKey = appName + '.';
    Object.keys(this.cacheMap).forEach((key) => {
      if (!appName || key.startsWith(preKey)) {
        delete this.cacheMap[key];
      }
    });
  }

  get(appName: string, key: string) {
    return this.cacheMap[`${appName}.${key}`];
  }

  set(appName: string, key: string, value: any) {
    if (typeof value === 'undefined') {
      delete this.cacheMap[`${appName}.${key}`];
    } else {
      this.cacheMap[`${appName}.${key}`] = value;
    }
  }

  clearTemplateCache() {
    const appList = this.get(this.APP_GLOBAL, AppCacheKeys.APP_LIST) as string[];
    appList.forEach((appName) => {
      this.set(appName, AppCacheKeys.TEMPLATE, undefined);
    });
  }
}

export const appCache = AppCache.getInstance();
