import app from "./app";
import { dataSource } from "./datasource";

dataSource
  .initialize()
  .then(() => {
    console.log("Database connected");

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  })
  .catch((err) => console.error(err));
