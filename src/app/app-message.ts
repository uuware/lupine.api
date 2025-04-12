import cluster from 'cluster';
import { Logger, LogWriter } from '../lib';
import { processDebugMessage } from './process-dev-requests';

const logger = new Logger('app-message');
const broadcast = (msgObject: any) => {
  for (let i in cluster.workers) {
    if (cluster.workers[i]) cluster.workers[i].send(msgObject);
  }
};

export const processMessageFromPrimary = (msgObject: any) => {
  if (!msgObject || !msgObject.id) {
    logger.warn(`Unknown message from master in work: ${cluster.worker?.id}`);
    return;
  }

  if (msgObject.id == 'debug') {
    processDebugMessage(msgObject);
  } else {
    logger.warn(`Unknown message: ${msgObject.id}`);
  }
};

export const processMessageFromWorker = (msgObject: any) => {
  if (!msgObject || !msgObject.id) {
    if (msgObject['watch:require']) return;
    logger.warn(`Unknown message from work: ${cluster.worker?.id}`);
    return;
  }

  if (msgObject.id == 'LogWriter') {
    LogWriter.messageFromSubProcess(msgObject);
  } else if (msgObject.id == 'debug') {
    // client to master, now this is master
    logger.debug(
      `Message from worker ${cluster.worker?.id}, message: ${msgObject.message}, appName: ${msgObject.appName}`
    );
    broadcast(msgObject);
    // if it's suspend, the primary process will exit
    if (msgObject.message === 'suspend') {
      // for (let id in cluster.workers) {
      //   if (cluster.workers[id]) {
      //     let process_id = cluster.workers[id].process.pid;
      //     process.kill(process_id!);
      //   }
      // }
      setTimeout(() => {
        console.log(`[server primary] Received suspend command.`, cluster.workers);
        process.exit(-1);
      }, 100);
    }
  } else {
    logger.warn(`Unknown message: ${msgObject.id}`);
  }
};
