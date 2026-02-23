import { createApp, log } from "./app";

(async () => {
  if (process.env.NODE_ENV === "production") {
    const { httpServer } = await createApp({ serveClient: true });
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  } else {
    const { app, httpServer } = await createApp({ serveClient: false });
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  }
})();
