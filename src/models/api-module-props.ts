import { ServerResponse } from 'http';
import { HostToPathProps, ServerRequest } from '../api';
import { AsyncStorageProps } from './async-storage-props';
import { AppCache } from '../app';

export interface IApiModule {
  processApi(store: AsyncStorageProps, url: string, req: ServerRequest, res: ServerResponse): Promise<boolean>;
  initApi(appConfig: HostToPathProps, appCache: AppCache): Promise<void>;
}
