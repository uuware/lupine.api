import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { MiniWebSocket } from './mini-web-socket';

export class DebugService {
  static clientRefreshFlag = Date.now();
  static clients = new Set();
  static miniWebSocket = new MiniWebSocket(this.onMessage.bind(this));

  public static onMessage(msg: string, socket: Duplex) {
    try {
      const json = JSON.parse(msg);
      if (json.message === 'get-flag') {
        this.miniWebSocket.sendMessage(
          socket,
          JSON.stringify({
            message: 'flag',
            flag: DebugService.clientRefreshFlag,
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  public static handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    this.miniWebSocket.handleUpgrade(req, socket, head);

    // socket.write(JSON.stringify({ message: 'flag', flag: DebugService.clientRefreshFlag }));
  }

  public static broadcastRefresh() {
    this.clientRefreshFlag = Date.now();
    const msg = { message: 'Refresh', flag: this.clientRefreshFlag };
    this.miniWebSocket.broadcast(JSON.stringify(msg));
  }
}
