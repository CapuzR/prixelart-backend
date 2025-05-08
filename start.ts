import app from "./server";
import { connectMongo } from "./mongo";

(async (): Promise<void> => {
  try {
    await connectMongo();
    app.listen(8000, (): void => {
      console.log("Server started.");
    });
  } catch (e) {
    console.error(e);
  }
})();
