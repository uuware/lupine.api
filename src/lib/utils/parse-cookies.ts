export const parseCookies = (str: string | undefined) => {
  let rx = /([^;=\s]*)=([^;]*)/g;
  let obj: { [key: string]: string } = {};
  if (str) {
    for (let m; (m = rx.exec(str)); ) {
      obj[m[1]] = decodeURIComponent(m[2]);
    }
  }
  return obj;
};
