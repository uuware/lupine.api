import { Logger } from '../lib';
import path from 'path';
import { appCache } from './app-cache';
import { HostToPathProps } from '../models/host-to-path-props';
import { AppLoaderProps } from '../models';
import { IApiModule } from '../models/api-module-props';

class AppLoader {
  logger: Logger = new Logger('app-loader');

  constructor() {}

  async loadApi(config: AppLoaderProps) {
    // const apps: Set<string> = new Set();
    // for (let key in config.webHostMap) {
    //   // one app may be defined for multiple hosts, but Set only stores unique values
    //   apps.add(config.webHostMap[key].appName);
    //   config.webHostMap[key].realPath = path.join(config.serverRoot, config.webHostMap[key].appName + '_web');
    //   config.webHostMap[key].dataPath = path.join(config.serverRoot, config.webHostMap[key].appName + '_data');
    //   config.webHostMap[key].apiPath = path.join(config.serverRoot, config.webHostMap[key].appName + '_api');
    // }

    appCache.set(
      appCache.APP_GLOBAL,
      appCache.KEYS.APP_LIST,
      config.webHostMap.map((item) => item.appName)
    );
    for (let appConfig of config.webHostMap) {
      await this.callInitApi(appConfig);
      appCache.set(appConfig.appName, appCache.KEYS.API_CONFIG, appConfig);
    }
  }

  async callInitApi(appConfig: HostToPathProps) {
    const apiPath = path.join(process.cwd(), 'dist/server_root', appConfig.appName + '_api/index.js');
    try {
      // const module = await import(apiPath);
      const module = require(apiPath);
      this.logger.debug(`========= ${appConfig.appName} apiModule: `, module);

      if (module && module.apiModule && typeof module.apiModule.initApi === 'function') {
        const apiModule = module.apiModule as IApiModule;
        appCache.set(appConfig.appName, appCache.KEYS.API_MODULE, apiModule);

        // Need to set appCache from app to api
        await apiModule.initApi(appConfig, appCache);
      }
    } catch (err: any) {
      this.logger.error(`appName: ${appConfig.appName}, load api error: `, err);
    }
  }

  async refreshApi(appConfig: HostToPathProps) {
    // TODO: call unloadApi?
    const apiPath = path.join(process.cwd(), 'dist/server_root', appConfig.appName + '_api/index.js');
    for (const path in require.cache) {
      if (path.endsWith('.js') && path.indexOf(apiPath) <= 0) {
        console.log(`clear cache: ${path}`);
        delete require.cache[path];
      }
    }
    await this.callInitApi(appConfig);
  }
}

export const appLoader = new AppLoader();
