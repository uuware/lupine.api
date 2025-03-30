import { ServerResponse } from 'http';
import { IApiBase, Logger, ServerRequest, ApiRouter } from 'lupine.api';
// import { AdminUser } from './admin-user';
import { AdminDb } from './admin-db';
import { AdminMenu } from './admin-menu';
import { devAdminAuth, needDevAdminSession } from './admin-auth';
import { getPerformanceData } from './admin-performance';
import { AdminRelease } from './admin-release';

const logger = new Logger('admin-api');

export class AdminApi implements IApiBase {
  protected router = new ApiRouter();
  adminUser: any;

  constructor() {
    this.mountDashboard();
  }

  public getRouter(): ApiRouter {
    return this.router;
  }

  protected mountDashboard() {
    const adminDb = new AdminDb();
    this.router.use('/db', needDevAdminSession, adminDb.getRouter());

    // const adminUsers = new AdminUser();
    // this.router.use('/user', needDevAdminSession, adminUsers.getRouter());

    const adminMenus = new AdminMenu();
    this.router.use('/menu', needDevAdminSession, adminMenus.getRouter());

    this.router.use('/performance', needDevAdminSession, getPerformanceData);

    const adminRelease = new AdminRelease();
    this.router.use('/release', adminRelease.getRouter());

    this.router.use('/auth', async (req: ServerRequest, res: ServerResponse) => {
      return devAdminAuth(req, res);
    });
  }
}
