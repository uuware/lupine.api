/**
 * A simple settings/config class for storing key/value pairs in config.json file
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { FsUtils, Logger } from '..';

export class AppConfig {
  static WEB_SETTINGS_KEY = 'web';

  static configMap: { [key: string]: any } = {};
  static logger = new Logger('server-config');
  static cfgPath = '';

  static async load(rootPath: string) {
    this.cfgPath = path.join(rootPath, 'config.json');

    let tempPath = this.cfgPath;
    try {
      if (!(await FsUtils.pathExist(this.cfgPath))) {
        tempPath = path.join(rootPath, 'resources', 'config.json');
      }

      let json;
      if ((json = await fs.readFile(tempPath, 'utf-8'))) {
        this.configMap = JSON.parse(json);
      }
    } catch (e: any) {
      this.configMap = {};
      this.logger.error('Loading json file failed: ' + tempPath, e.message);
    }

    return this.configMap;
  }

  static async save() {
    if (!this.cfgPath) {
      throw new Error('Data path not set');
    }
    // the folder should be created when the server starts
    await fs.writeFile(this.cfgPath, JSON.stringify(this.configMap));
  }

  static get(key: string) {
    return this.configMap[key];
  }
  static getAll() {
    return this.configMap;
  }

  static set(key: string, value: any) {
    if (typeof value === 'undefined') {
      delete this.configMap[key];
    } else {
      this.configMap[key] = value;
    }
  }
}
