// const request = require('request');
import * as fs from 'fs';
import * as path from 'path';
import { ServerResponse } from 'http';
import { Logger } from '../lib';
import { ServerRequest } from '../models/locals-props';
import { handler200, handler404, handler500 } from './handle-status';
import { isServerSideRenderUrl, serverSideRenderPage } from './server-render';
import { serverContentType } from './server-content-type';
import { apiCache } from './api-cache';

export class StaticServer {
  logger = new Logger('StaticServer');

  private async sendFile(realPath: string, requestPath: string, res: ServerResponse) {
    try {
      // const text = fs.readFileSync(realPath);
      // createReadStream has default autoClose(true)
      // https://nodejs.org/api/fs.html#fscreatereadstreampath-options
      const fileStream = fs.createReadStream(realPath);
      fileStream.on('error', (error) => {
        this.logger.warn(`File not found: ${realPath}`);
        handler404(res);
        return true;
      });
      fileStream.on('open', () => {
        let ext = path.extname(realPath);
        ext = ext ? ext.slice(1) : 'unknown';
        const contentType = serverContentType[ext] || 'text/plain';
        res.writeHead(200, {
          'Content-Type': contentType + '; charset=UTF-8',
        });
      });
      fileStream.on('end', function () {
        res.end();
      });
      // res.write(text);
      // res.end();
      fileStream.pipe(res);

      return true;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        this.logger.warn(`File not found: ${realPath}`);
        handler200(res, `File not found: ${requestPath}`);
      } else {
        this.logger.error(`Error for: ${realPath}`, err);
        handler200(res, 'Service failed: ' + err.message);
      }
      return true;
    }
  }

  async processRequest(req: ServerRequest, res: ServerResponse, rootUrl?: string) {
    this.logger.info(`StaticServer, url: ${req.locals.url}, host: ${req.locals.host}, rootUrl: ${rootUrl}`);

    // const hostPath = req.locals.hostPath;
    const hostPath = apiCache.getAsyncStore().hostPath;
    const realPath = rootUrl || req.locals.urlWithoutQuery;
    const urlSplit = realPath.split('?');
    const fullPath = path.join(hostPath.realPath, urlSplit[0]);
    try {
      if (urlSplit[0] === '/' || urlSplit[0] === '/index.html') {
        const error = new Error();
        (error as any).code = 'ENOENT';
        // jump to serverSideRenderPage
        throw error;
      }

      const resolvedPath = await fs.promises.realpath(fullPath);
      console.log(`request: ${resolvedPath}`);
      // for security reason, the requested file should be inside of wwwRoot
      if (resolvedPath.substring(0, hostPath.realPath.length) !== hostPath.realPath) {
        this.logger.warn(`ACCESS DENIED: ${urlSplit[0]}`);
        handler200(res, `ACCESS DENIED: ${urlSplit[0]}`);
        return true;
      }

      try {
        const realFile = (await fs.promises.lstat(resolvedPath)).isDirectory()
          ? path.join(resolvedPath, 'index.html')
          : resolvedPath;
        await this.sendFile(realFile, urlSplit[0], res);
      } catch (err: any) {
        this.logger.warn(`File not found: ${urlSplit[0]}`);
        handler200(res, `File not found: ${urlSplit[0]}`);
      }
      return true;
    } catch (err: any) {
      // file doesn't exist
      if (err.code === 'ENOENT') {
        if (isServerSideRenderUrl(urlSplit[0])) {
          serverSideRenderPage(hostPath.appName, hostPath.realPath, urlSplit[0], urlSplit[1], req, res);
        } else {
          this.logger.error(`File not found: ${urlSplit[0]}`);
          handler404(res, `File not found: ${urlSplit[0]}`);
        }
      } else {
        this.logger.error(`Error for: ${urlSplit[0]}`, err);
        handler500(res, `processRequest error: ${err.message}`);
      }
      return true;
    }
  }
}
