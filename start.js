const app = require("./server");
const mongo = require("./mongo.js");

(async (arg1, arg2, arg3) => {
  await mongo().then((mongoose) => {
    try {
      app.listen(8000, () => {
        console.log("Server started.");
      });
    } catch (e) {
      console.log(e);
    }
  });
})();
