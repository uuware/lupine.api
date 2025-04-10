import { ServerResponse } from 'http';
import { Logger } from '../lib/logger';
import { handler404 } from '../api';
import { appCache } from './app-cache';
import { AsyncStorageProps } from '../models/async-storage-props';
import { ApiRouterCallback } from '../models/api-router-props';
import { ServerRequest } from '../models';
const logger = new Logger('web-router');

export class WebProcessor {
  static debugPath: string | undefined;
  static debugHandler: ApiRouterCallback | undefined;

  static enableDebug(path: string, debugHandler: ApiRouterCallback) {
    WebProcessor.debugPath = path;
    WebProcessor.debugHandler = debugHandler;
  }

  async processRequest(store: AsyncStorageProps, req: ServerRequest, res: ServerResponse) {
    if (WebProcessor.debugPath && req.locals.urlWithoutQuery.startsWith(WebProcessor.debugPath)) {
      if (WebProcessor.debugHandler) {
        await WebProcessor.debugHandler(req, res, req.locals.urlWithoutQuery);
        return true;
      }
    }

    // check if the request is handled by the api
    try {
      const _lupineApi = appCache.get(store.appName, appCache.KEYS.API_MODULE);
      if (_lupineApi && _lupineApi.processApi) {
        const result = await _lupineApi.processApi(store, store.locals.urlWithoutQuery, req, res);
        if (result) {
          return true;
        }
      } else {
        logger.error(`url: ${store.locals.url}, appName: ${store.appName}, no api module found`);
      }
    } catch (e: any) {
      logger.error(`url: ${store.locals.url}, appName: ${store.appName}, process api error: `, e.message);
    }

    handler404(res, `Request is not processed, url: ${req.locals.url}`);
    return true;
  }
}
