import cluster from 'cluster';
import { Logger, LogWriter } from '../lib';
import { WebProcessor } from './web-processor';
import { appLoader } from './app-loader';
import { processMessageFromPrimary, processMessageFromWorker } from './app-message';
import { WebServer } from './web-server';
import { processDevRequests } from './process-dev-requests';
import { appCache } from './app-cache';
import { HostToPath } from '../api';
import { AppStartProps, InitStartProps, LogConfig } from '../models';

class AppStart {
  debug: boolean = false;
  logger: Logger = new Logger('api-start');
  webServer: WebServer | undefined;

  getWorkerId() {
    return cluster.worker ? cluster.worker.id : 0;
  }

  start(props: AppStartProps, webServer?: WebServer) {
    // props.debug = false;
    appCache.set(appCache.APP_GLOBAL, appCache.KEYS.APP_DEBUG, props.debug);
    appCache.set(appCache.APP_GLOBAL, appCache.KEYS.START_TIME, new Date());
    appCache.set(appCache.APP_GLOBAL, appCache.KEYS.RENDER_PAGE_FUNCTIONS, props.renderPageFunctions);
    this.webServer = webServer || new WebServer();

    this.debug = props.debug;
    this.bindProcess();
    this.initLog(props.logConfig);

    // call the Logger after initLog
    this.logger.debug(
      `${cluster.isPrimary ? 'Primary Process' : 'Worker Process'}, Starting Server - process id ${
        process.pid
      }, path: ${process.cwd()}`
    );

    if (props.debug || !cluster.isPrimary) {
      this.logger.debug(`Worker id ${this.getWorkerId()}`);
      process.on('message', processMessageFromPrimary);

      HostToPath.setHostToPathList(props.apiConfig.webHostMap);
      appLoader.loadApi(props.apiConfig);
      this.initServer(props.serverConfig);
    } else if (cluster.isPrimary) {
      const numCPUs = require('os').cpus().length;
      this.logger.debug(`Master Process is trying to fork ${numCPUs} processes`);

      for (let i = 0; i < numCPUs; i++) {
        let worker = cluster.fork();
        worker.on('message', processMessageFromWorker);
      }

      cluster.on('death', (worker: any) => {
        this.logger.warn(`Worker ${worker.pid} died; starting a new one...`);
        cluster.fork();
      });
    }
  }

  bindProcess() {
    if (cluster.isPrimary) {
      // it looks like the child processes are hung up here
      process.stdin.resume(); // so the program will not close instantly
    }
    // Emitted whenever a no-error-handler Promise is rejected
    process.on('unhandledRejection', (reason: string, promise) => {
      console.error(`${process.pid} - Process on unhandledRejection, promise: `, promise, ', reason: ', reason);
    });

    // do something when app is closing
    process.on('exit', (ret) => {
      console.log(`${process.pid} - Process on exit, code: ${ret}`);
    });
    // catches ctrl+c event
    process.on('SIGINT', () => {
      console.log(`${process.pid} - Process on SIGINT, exit.`);
      process.exit();
    });
    // catches uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      console.error(`${process.pid} - Process on uncaughtException: `, err);
      console.error(err.stack);
    });
  }

  initLog(config: LogConfig) {
    LogWriter.init(config);
  }

  async initServer(config: InitStartProps) {
    const bindIp = config.bindIp || '::';
    const httpPort = config.httpPort || 8080;
    const httpsPort = config.httpsPort || 8443;
    const sslKeyPath = config.sslKeyPath || '';
    const sslCrtPath = config.sslCrtPath || '';

    this.logger.info(`Starting Web Server, httpPort: ${httpPort}, httpsPort: ${httpsPort}`);
    // for dev to refresh the FE or stop the server
    // if (this.debug) {
    // webServer.use('/debug', processDevRequests);
    WebProcessor.enableDebug('/debug', processDevRequests);
    // }

    this.webServer!.startHttp(httpPort, bindIp);
    this.webServer!.startHttps(httpsPort, bindIp, sslKeyPath, sslCrtPath);
  }
}

export const appStart = new AppStart();
