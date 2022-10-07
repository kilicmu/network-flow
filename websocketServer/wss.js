const { WebSocketServer } = require("ws");
const noop = () => {};

class WSServer {
  server = null;
  clients = [];
  static init(server) {
    const serv = new WSServer();
    serv.server = new WebSocketServer({ server });
    serv.server.on("connection", function connection(ws, request, client) {
      //   console.log(request.url);
      const { url } = request;
      if (!/^\/ws$/.test(url)) {
        return;
      }
      // remove client
      ws.on("close", () => {
        const idx = serv.clients.findIndex((client) => client.ws === ws);
        serv.clients.splice(idx, 1);
      });
      serv.clients.push(new WSClient(ws));
      return serv;
    });
  }
}

class WSClient {
  ws = null;
  intervalToken = null;

  constructor(ws) {
    ws.on("message", (data) => {
      this.ws.send(data)
        
    });

    ws.on("open", () => {
      console.log("on open");
    });

    this.ws = ws;
  }
}

module.exports = {
  WSServer,
};
