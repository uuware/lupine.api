import { AppCache, DbConfig, DbHelper, HostToPathProps, IApiBase, LogWriter, ServerRequest } from 'lupine.api';
import { ServerResponse } from 'http';
import path from 'path';
import { apiCache, AppConfig, asyncLocalStorage, bindRenderPageFunctions } from '.';
import { IApiModule } from '../models/api-module-props';
import { AsyncStorageProps } from '../models/async-storage-props';

export class ApiModule implements IApiModule {
  rootApi: IApiBase;
  constructor(api: IApiBase) {
    this.rootApi = api;
  }

  public async processApi(store: AsyncStorageProps, url: string, req: ServerRequest, res: ServerResponse) {
    let result = false;
    await asyncLocalStorage.run(store, async () => {
      if (await this.rootApi.getRouter().findRoute(url, req, res, true)) {
        result = true;
        return true;
      }
    });
    return result;
  }

  // appCache is from app-loader (parent scope), not the same in current scope
  public async initApi(appConfig: HostToPathProps, appCacheFromApp: AppCache) {
    // set app's appCache to api's appCache
    AppCache.replaceInstance(appCacheFromApp);
    // set RENDER_PAGE_FUNCTIONS to API module
    bindRenderPageFunctions(
      appCacheFromApp.get(appCacheFromApp.APP_GLOBAL, appCacheFromApp.KEYS.RENDER_PAGE_FUNCTIONS)
    );

    console.log(`appConfig: `, appConfig);
    apiCache.set(apiCache.KEYS.APP_DATA, appConfig);
    // apiCache.set(apiCache.KEYS.APP_CACHE, appCache);

    appConfig.logConfig.folder = path.join(appConfig.dataPath, 'logs');
    LogWriter.init(appConfig.logConfig);

    await this.initConfig(appConfig);
    apiCache.clearTemplateCache();

    appConfig.dbConfig.filename = path.join(appConfig.dataPath, 'sqlite3.db');
    await this.initDb(appConfig.dbConfig);
  }

  private async initDb(config: DbConfig) {
    const db = await DbHelper.createInstance(config);
    apiCache.set(apiCache.KEYS.DB, db);
    return db;
  }

  private async initConfig(appConfig: HostToPathProps) {
    await AppConfig.load(appConfig.dataPath);
  }
}
