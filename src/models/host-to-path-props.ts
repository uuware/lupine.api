import { DbConfig } from './db-config';
import { LogConfig } from './logger-props';

export type HostToPathProps = {
  hosts: string[];
  // path: string;
  realPath: string;
  dataPath: string;
  apiPath: string;
  appName: string;
  dbType: string;
  // dbFilename: string;
  logConfig: LogConfig;
  dbConfig: DbConfig;
};
