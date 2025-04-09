import { ServerResponse } from 'http';
import { AsyncStorageProps } from './async-storage-props';
import { AppCache } from '../app';
import { ServerRequest } from './locals-props';
import { HostToPathProps } from './host-to-path-props';

export interface IApiModule {
  processApi(store: AsyncStorageProps, url: string, req: ServerRequest, res: ServerResponse): Promise<boolean>;
  initApi(appConfig: HostToPathProps, appCache: AppCache): Promise<void>;
}
