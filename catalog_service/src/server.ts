import expressApp from "./expressApp";

const PORT = process.env.PORT || 3000;

// TODO: implement repo connection
// line below causes circular dependency
//
// export const repo = new CatalogRepository();

export const StartServer = async () => {
  expressApp.listen(PORT, () => {
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
