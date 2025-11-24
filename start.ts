import { httpServer } from "./server.ts";
import { connectMongo } from "./mongo.ts";
import { initializeSocketListeners } from './socketListeners.ts';

(async (): Promise<void> => {
  try {
    await connectMongo();
    initializeSocketListeners();

    httpServer.listen(8000, (): void => {
      console.log("Server started.");
    });
  } catch (e) {
    console.error(e);
  }
})();
