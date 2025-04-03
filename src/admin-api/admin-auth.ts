import { ServerResponse } from 'http';
import { Logger, ServerRequest, ApiHelper, apiCache } from 'lupine.api';
import { CryptoUtils } from '../lib/utils/crypto';
import { adminHelper, DEV_ADMIN_CRYPTO_KEY_NAME, DEV_ADMIN_TYPE, DevAdminSessionProps } from './admin-helper';
import { langHelper } from '../lang';

// const logger = new Logger('admin-login');
export const needDevAdminSession = async (req: ServerRequest, res: ServerResponse) => {
  const devAdminSession = await adminHelper.getDevAdminFromCookie(req, res, true);
  if (!devAdminSession) {
    return true;
  }
  return false;
};

// dev admin, for development only
export const devAdminAuth = async (req: ServerRequest, res: ServerResponse) => {
  const cryptoKey = process.env[DEV_ADMIN_CRYPTO_KEY_NAME];
  if (!cryptoKey) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:crypto_key_not_set', {
        cryptoKey: DEV_ADMIN_CRYPTO_KEY_NAME,
      }),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
  if (!process.env['DEV_ADMIN_PASS']) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:name_not_set', {
        name: 'DEV_ADMIN_PASS',
      }),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  // TODO: secure and httpOnly cookies
  const data = req.locals.json();
  if (!data || Array.isArray(data) || !data.u || !data.p) {
    // if session already exists, use session data login
    const devAdminSession = await adminHelper.getDevAdminFromCookie(req, res, true);
    if (!devAdminSession) {
      return true;
    }
    const response = {
      status: 'ok',
      message: langHelper.getLang('shared:login_success'),
      result: CryptoUtils.encrypt(JSON.stringify(devAdminSession), cryptoKey),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  if (data.u === process.env['DEV_ADMIN_USER'] && data.p === process.env['DEV_ADMIN_PASS']) {
    const devSession: DevAdminSessionProps = {
      u: data.u,
      t: DEV_ADMIN_TYPE,
      ip: req.socket.remoteAddress as string,
      h: CryptoUtils.hash(data.u + ':' + data.p),
    };
    const token = JSON.stringify(devSession);
    const response = {
      status: 'ok',
      message: langHelper.getLang('shared:login_success'),
      result: CryptoUtils.encrypt(token, cryptoKey),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const response = {
    status: 'error',
    message: langHelper.getLang('shared:login_failed'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};
