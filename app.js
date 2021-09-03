const { default: axios } = require("axios");

require("dotenv").config();
const app = require("express")();
const port = process.env.PORT || 8080;

app.use(
  require("cors")({
    origin: "*",
  })
);
app.use(require("morgan")("common"));

app.set("trust proxy", true);
app.disable("x-powered-by");

app.use(require("./routes"));

app.listen(port, () => {
  axios
    .get("http://ipv4.icanhazip.com")
    .then((r) => console.log(`Public IP: ${r.data}`));
  console.log(`App Listening on :${port}`);
});
