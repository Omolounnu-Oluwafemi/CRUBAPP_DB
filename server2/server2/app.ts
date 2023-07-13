import http, { IncomingMessage, Server, ServerResponse } from "http";
/*
implement your server code here
*/

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET") {
      res.end(JSON.stringify({ name: "hello" }));
    }
  }
);

server.listen(3001);
