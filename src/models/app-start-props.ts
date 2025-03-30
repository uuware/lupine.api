import { AppLoaderProps } from './app-loader-props';
import { LogConfig } from './logger-props';

export type InitStartProps = {
  bindIp: string;
  httpPort: number;
  httpsPort: number;
  sslKeyPath: string;
  sslCrtPath: string;
};

export type AppStartProps = {
  debug: boolean;
  logConfig: LogConfig;
  apiConfig: AppLoaderProps;
  serverConfig: InitStartProps;
};
