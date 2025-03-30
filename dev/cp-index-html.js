const path = require('path');
const fs = require('fs/promises');
const webEnv = require('../src/common-js/web-env.js');

const fileSizeAndTime = async (filename) => {
  try {
    var stats = await fs.stat(filename);
    return { size: stats.size, mtime: stats.mtime };
  } catch (e) {
    return false;
  }
};
const fileUpdateTime = async (filename, time) => {
  fs.utimes(filename, time, time);
};

exports.cpIndexHtml = async (htmlFile, outputFile, appName) => {
  const f1 = await fileSizeAndTime(htmlFile);
  const f2 = await fileSizeAndTime(outputFile);

  if (!f2 || f1.mtime.getTime() != f2.mtime.getTime()) {
    const inHtml = await fs.readFile(htmlFile, 'utf-8');
    // const outStr = inHtml.replace(/{hash}/gi, new Date().getTime().toString(36)).replace('\<\!--META-ENV--\>', JSON.stringify(envWeb));
    // env is replaced here for the mobile app. And the env is replaced again for the web app at each startup
    const outStr = webEnv.replaceWebEnv(inHtml, appName, true).replace(/{hash}/gi, new Date().getTime().toString(36));
    // const outStr = inHtml.replace(/{hash}/gi, new Date().getTime().toString(36));
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, outStr);
    await fileUpdateTime(outputFile, f1.mtime);
  }
};
