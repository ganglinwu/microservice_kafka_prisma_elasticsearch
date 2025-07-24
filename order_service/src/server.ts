import "dotenv/config";
import expressApp from "./expressApp.js";

const PORT = parseInt(process.env.APP_PORT || "3001", 10);

// TODO: implement repo connection
// line below causes circular dependency
//
// export const repo = new CatalogRepository();

export const StartServer = async () => {
  expressApp.listen(PORT, "0.0.0.0", () => {
    console.log("Listening on: ", PORT);
  });

  process.on("uncaughtException", async (err) => {
    console.log(err);
    process.exit(1);
  });
};

StartServer().then(() => {
  console.log("server is up");
});
