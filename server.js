// server.js
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Beni Pett backend listening on port ${PORT}`);
});
