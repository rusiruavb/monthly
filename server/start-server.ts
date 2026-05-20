import type { Server } from "node:http";
import { createApp } from "./app.js";

export type StartedServer = {
  app: ReturnType<typeof createApp>;
  server: Server;
  port: number;
  host: string;
};

export async function startServer(): Promise<StartedServer> {
  const app = createApp();

  const requestedPort = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? "0.0.0.0";

  const server = await new Promise<Server>((resolve, reject) => {
    const s = app.listen(requestedPort, host, () => resolve(s));
    s.on("error", reject);
  });

  const address = server.address();
  const port =
    address && typeof address === "object" && "port" in address
      ? Number(address.port)
      : requestedPort;

  return { app, server, port, host };
}

