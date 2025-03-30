import sqlite3, { Database } from 'sqlite3';
import { Logger } from '../logger';
import { Db } from './db';
import { DbConfig } from '../../models/db-config';

const logger = new Logger('db-sqlite');
export class DbSqlite extends Db {
  db!: Database;

  constructor(option: DbConfig) {
    super(option);

    this.db = new sqlite3.Database(option.filename!, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE);

    if (logger.isDebug()) {
      this.testConnection();
    }
  }

  close() {
    this.db.close();
  }

  connect() {
    return Promise.resolve();
  }

  // INSERT...RETURNING is also supported in MariaDB from 10.5.0
  public nativeQuery(sql: string, params?: any, addReturning?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql2 = addReturning ? sql + ' returning *' : sql;
      this.db.all(sql2, params, (err: any, rows: any) => {
        if (err) {
          console.error('query:', sql, ', params:', params, ', error:', err);
          reject(err);
        } else {
          if (logger.isDebug()) {
            console.log('query:', sql, ', params:', params, ', result:', rows.length);
          }
          resolve(rows);
        }
      });
    });
  }

  public async truncateTable(tableName: string): Promise<any> {
    // sqlite doesn't have DROP command
    return this.query(`DELETE FROM ${tableName}`);
  }

  // public async createTable(table: string, fields: string[]) {
  //   // table = this.replacePrefix(table);
  //   const query = 'CREATE TABLE ' + table + ' (' + fields.join(',') + ')';
  //   return await this.query(query);
  // }

  public async getTableCount(tableName: string) {
    const result = await this.query(`SELECT COUNT(*) as c FROM ${tableName}`);
    return result[0].c;
  }

  public async getAllTables(addCount = false) {
    const query = `SELECT * FROM sqlite_master WHERE type ='table';`;
    const result = await this.query(query);
    if (result) {
      if (addCount) {
        for (let i in result) {
          result[i].count = await this.getTableCount(result[i].tbl_name);
        }
      }
      return result;
    }
    return false;
  }

  public async getTableInfo(table: string): Promise<any> {
    const query = `PRAGMA table_info(${table});`;
    const result = await this.query(query);
    return result;
  }
}
