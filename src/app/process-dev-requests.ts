import { Logger } from '../lib/logger';
import { ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { appLoader } from './app-loader';
import { appCache } from './app-cache';
import { apiCache } from '../api';
import { DebugService } from '../api/debug-service';
import { ServerRequest } from '../models';
const logger = new Logger('process-dev-requests');

function deleteRequireCache(moduleName: string) {
  var solvedName = require.resolve(moduleName),
    nodeModule = require.cache[solvedName];
  if (nodeModule) {
    for (var i = 0; i < nodeModule.children.length; i++) {
      var child = nodeModule.children[i];
      deleteRequireCache(child.filename);
    }
    delete require.cache[solvedName];
  }
}

export const processDebugMessage = async (msgObject: any) => {
  logger.info(`processDebugMessage, id: ${msgObject && msgObject.id}, message: ${msgObject && msgObject.message}`);
  if (msgObject.id === 'debug' && msgObject.message === 'refresh') {
    if (msgObject.appName) {
      const appConfig = appCache.get(msgObject.appName, appCache.KEYS.API_CONFIG);
      appLoader.refreshApi(appConfig);
    } else {
      // refresh all
      let appList = appCache.get(appCache.APP_GLOBAL, appCache.KEYS.APP_LIST);
      // if (!appList) {
      //   const appCache2 = apiCache.get(apiCache.KEYS.APP_CACHE); // from parent scope
      //   appList = appCache2.get(appCache2.APP_GLOBAL, appCache2.KEYS.APP_LIST);
      // }
      for (const appName of appList) {
        const appConfig = appCache.get(appName, appCache.KEYS.API_CONFIG);
        appLoader.refreshApi(appConfig);
      }
    }

    // clear html cache
    apiCache.clearTemplateCache();

    console.log(`broadcast refresh request to clients.`);
    DebugService.broadcastRefresh();
  }
  if (msgObject.id === 'debug' && msgObject.message === 'suspend') {
    // Only when it's debug mode, it can go here, otherwise suspend should be processed in processMessageFromWorker
    console.log(`[server] Received suspend command.`);
    process.exit(-1);
  }
};

export async function processRefreshCache(req: ServerRequest) {
  // if this is a child process, we need to notice parent process to broadcast to all clients to refresh
  if (process.send) {
    const appName = req.locals.query.get('appName');
    process.send({ id: 'debug', message: 'refresh', appName });
  }
  // if it's debug mode (only one process)
  else {
    // if (appCache.get(appCache.APP_GLOBAL, appCache.KEYS.API_DEBUG) === true)
    const appName = req.locals.query.get('appName');
    processDebugMessage({ id: 'debug', message: 'refresh', appName });
  }
}

// this is only for local development
export async function processDevRequests(req: ServerRequest, res: ServerResponse, rootUrl?: string) {
  res.end();
  const address = req.socket.address() as AddressInfo;
  if (address.address !== '127.0.0.1') {
    console.log(`[server] Ignore request from: `, req.url, address.address);
    return true;
  }
  if (req.url === '/debug/suspend') {
    console.log(`[server] Received suspend command.`);
    if (process.send) {
      // send to parent process to kill all
      process.send({ id: 'debug', message: 'suspend' });
    }
    // if it's debug mode (only one process)
    else if (appCache.get(appCache.APP_GLOBAL, appCache.KEYS.APP_DEBUG) === true) {
      processDebugMessage({ id: 'debug', message: 'suspend' });
    }
  } else if (req.url === '/debug/refresh') {
    processRefreshCache(req);
  }
  if (req.url === '/debug/client') {
  }
  return true;
}
