import * as fs from 'fs';
import * as path from 'path';
import { ServerResponse } from 'http';
import { Logger } from '../lib';
import { getWebEnv } from '../lib';
import { AppConfig } from './api-config';
import { ServerRequest } from '../models/locals-props';
import { ToClientDelivery } from './to-client-delivery';
import { IToClientDelivery } from '../models/to-client-delivery-props';
import { JsonObject } from '../models/json-object';
import { apiCache } from './api-cache';

const logger = new Logger('StaticServer');

export type RenderPageFunctionsType = {
  fetchData: (url: string, postData: string | JsonObject) => Promise<any>;
  [key: string]: Function;
};
let renderPageFunctions: RenderPageFunctionsType = {
  fetchData: async (url: string, postData: string | JsonObject) => {
    throw new Error('Method not implemented');
  },
};
export const getRenderPageFunctions = () => renderPageFunctions;
// for the FE code to fetch data in SSR
export const bindRenderPageFunctions = (calls: RenderPageFunctionsType) => {
  for (let k in calls) {
    renderPageFunctions[k] = calls[k];
  }
};

export type PageResultType = {
  content: string;
  title: string;
  metaData: string;
  themeName: string;
  globalCss: string;
};
type _LupineJs = {
  generatePage: (props: any, toClientDelivery: IToClientDelivery) => Promise<PageResultType>;
};

export const isServerSideRenderUrl = (urlWithoutQuery: string) => {
  /*
    ""                            -->   ""
    "name"                        -->   ""
    "name.txt"                    -->   "txt"
    ".htpasswd"                   -->   ""
    "name.with.many.dots.myext"   -->   "myext"
  */
  const ext = urlWithoutQuery.slice(((urlWithoutQuery.lastIndexOf('.') - 1) >>> 0) + 2);
  return ext === '' || ext === 'html';
};

const titleText = '<!--META-TITLE-->';
const metaTextStart = '<!--META-ENV-START-->';
const metaTextEnd = '<!--META-ENV-END-->';
const containerText = '<div class="lupine-root">'; // '</div>'
type CachedHtmlProps = {
  content: string;
  webEnv: { [k: string]: string };
  // serverConfig: { [k: string]: any };
  titleIndex: number;
  metaIndexStart: number;
  metaIndexEnd: number;
  containerIndex: number;
};
export const serverSideRenderPage = async (
  appName: string,
  webRoot: string,
  urlWithoutQuery: string,
  urlQuery: string,
  req: ServerRequest,
  res: ServerResponse
) => {
  console.log(`=========SSR, root: ${webRoot}, url: ${urlWithoutQuery}`);

  // the FE code needs to export _lupineJs
  // const lupinJs = await import(webRoot + '/index.js');
  const lupinJs = require(webRoot + '/index.js');
  if (!lupinJs || !lupinJs._lupineJs) {
    throw new Error('_lupineJs is not defined');
  }

  console.log(`=========load lupine: `, lupinJs);
  const _lupineJs = lupinJs._lupineJs() as _LupineJs;
  const props = {
    url: urlWithoutQuery,
    urlSections: urlWithoutQuery.split('/').filter((i) => !!i),
    query: Object.fromEntries(new URLSearchParams(urlQuery || '')), //new URLSearchParams(urlQuery || ''),
    urlParameters: {},
    renderPageFunctions: renderPageFunctions,
  };

  let cachedHtml = apiCache.get(apiCache.KEYS.TEMPLATE) as CachedHtmlProps;
  if (!cachedHtml) {
    const content = await fs.promises.readFile(path.join(webRoot, 'index.html'));
    // const contentWithEnv = replaceWebEnv(content.toString(), appName, false);
    const contentWithEnv = content.toString();
    cachedHtml = {
      content: contentWithEnv,
      webEnv: getWebEnv(appName),
      // serverConfig: ServerConfig.getAll(appName),
      titleIndex: contentWithEnv.indexOf(titleText),
      metaIndexStart: contentWithEnv.indexOf(metaTextStart),
      metaIndexEnd: contentWithEnv.indexOf(metaTextEnd),
      containerIndex: contentWithEnv.indexOf(containerText),
    };
    apiCache.set(apiCache.KEYS.TEMPLATE, cachedHtml);
  }

  const webSetting = AppConfig.get(AppConfig.WEB_SETTINGS_KEY) || {};
  const clientDelivery = new ToClientDelivery(cachedHtml.webEnv, webSetting, req.locals.cookies());
  const page = await _lupineJs.generatePage(props, clientDelivery);
  // console.log(`=========load lupin: `, content);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  // res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Encoding': 'gzip' });

  // const s = zlib.createGzip();
  // stream.pipeline(s, res, (err) => {
  //   s.write(cachedHtml.content.substring(0, cachedHtml.titleIndex).replace('<!--META-THEME-->', page.themeName));
  //   s.write(page.title);
  //   s.write(cachedHtml.content.substring(cachedHtml.titleIndex + titleText.length, cachedHtml.metaIndex));
  //   s.write(page.metaData);
  //   s.write(page.globalCss);
  //   s.write(
  //     cachedHtml.content.substring(cachedHtml.metaIndex + metaText.length, cachedHtml.containerIndex + containerText.length)
  //   )
  //   s.write(page.content);
  //   s.write(cachedHtml.content.substring(cachedHtml.containerIndex + containerText.length), (err) => {
  //     s.flush();
  //     res.end();
  //   });
  // });

  // data-theme and title
  res.write(cachedHtml.content.substring(0, cachedHtml.titleIndex).replace('<!--META-THEME-->', page.themeName));
  res.write(page.title);
  res.write(cachedHtml.content.substring(cachedHtml.titleIndex + titleText.length, cachedHtml.metaIndexStart));
  // meta data
  res.write(page.metaData);
  res.write(page.globalCss);
  res.write('<script id="web-env" type="application/json">' + JSON.stringify(cachedHtml.webEnv) + '</script>');
  res.write('<script id="web-setting" type="application/json">' + JSON.stringify(webSetting) + '</script>');
  res.write(
    cachedHtml.content.substring(
      cachedHtml.metaIndexEnd + metaTextEnd.length,
      cachedHtml.containerIndex + containerText.length
    )
  );
  // content
  res.write(page.content);
  res.write(cachedHtml.content.substring(cachedHtml.containerIndex + containerText.length));

  // const html = index.toString().replace('<div class="lupine-root"></div>', content);
  // handler200(res, html);
  res.end();
};
