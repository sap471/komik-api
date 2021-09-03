const router = require("express").Router();
const cheerio = require("cheerio");
const { default: axios } = require("axios");

const baseWebUrl = "https://komikindo.id";
const baseDetailUrl = "https://komikindo.id/komik";
const endpoint = {
  detail: "/detail",
  chapter: "/ch",
};
/**
 * [TODO]
 * - cache
 */

const asyncHandler = (fn) =>
  function asyncHandlerWrap(...args) {
    const fnReturn = fn(...args);
    const next = args[args.length - 1];
    return Promise.resolve(fnReturn).catch(next);
  };

router.use((req, res, next) => {
  req.axios = axios.create({
    baseURL: baseWebUrl,
    timeout: 10000,
    headers: {
      "X-Forwarded-For":
        req.ip ||
        req._remoteAddress ||
        (req.connection && req.connection.remoteAddress),
      "User-Agent":
        req.get("User-Agent") ||
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
    },
  });

  next();
});

router.get("/", (req, res) =>
  res.json({
    name: "ntabz_komik",
    author: "ntbz",
    from: "idn",
    help: {
      "/populer": "ambil manga terpopuler",
      "/manhwa": "korea",
      "/manhua": "china",
      "/search/:query": "ganti :query sama nama komik yang dicari",
      "/detail/:query": "info manga, kayak judul, author, chapter, dll",
      "/ch/:query": "list chapter gambar",
    },
  })
);

router.get(
  /^\/(populer|manhwa|manhua|search\/(?:([^\/]+?))\/?)$/,
  asyncHandler(async (req, res) => {
    let [route, query] = req.path.substr(1).split("/");

    if (route == "populer") {
      route = "/komik-populer";
    } else if (route == "search") {
      route = `/?s=${query}`;
    }

    const response = await req.axios.get(route);
    const result = [];

    if (response.status == 200) {
      const $ = cheerio.load(response.data);

      $(".film-list")
        .find(".animepost")
        .each((i, el) => {
          let title = $(el).find(".tt").text().trim();
          let url = $(el)
            .find(".animposx > a")
            .attr("href")
            .replace(baseDetailUrl, "/detail");
          let rating = $(el).find(".rating > i").text().trim();
          let cover = $(el).find(".limit > img").attr("src");

          result.push({ title, url, rating, cover });
        });
    }

    return res.json({ statusCode: res.statusCode, result });
  })
);

router.get(
  `${endpoint.detail}/:query`,
  asyncHandler(async (req, res) => {
    const query = req.params.query;
    const response = await req.axios.get(`/komik/${query}`);
    let result = {};
    if (response.status == 200) {
      const $ = cheerio.load(response.data);

      let name = $(".infoanime > h1").text().replace("Komik", "").trim();
      let alternative = $(".infox > .spe > span:nth-child(1)")
        .text()
        .replace(/.*:/, "")
        .trim()
        .split(", ");
      let status = $('.infox > .spe > span:contains("Status")')
        .text()
        .replace(/.*:/, "")
        .trim()
        .toLowerCase();
      let author = $('.infox > .spe > span:contains("Pengarang")')
        .text()
        .replace(/.*:/, "")
        .trim();
      let ilustrator = $('.infox > .spe > span:contains("Ilustrator")')
        .text()
        .replace(/.*:/, "")
        .trim();
      let comic_type = $('.infox > .spe > span:contains("Jenis Komik")')
        .text()
        .replace(/.*:/, "")
        .trim()
        .toLowerCase();
      let theme = $('.infox > .spe > span:contains("Tema")')
        .text()
        .replace(/.*:/, "")
        .trim()
        .split(", ");
      let genre = [];
      $(".genre-info > a").each((i, el) => {
        genre.push($(el).text().toLowerCase());
      });
      let sinopsis = $(".desc > .entry-content > p").text().trim();

      let chapter_list = [];
      $("#chapter_list > ul > li").each((i, el) => {
        let chapter = $(el).find("chapter").text().trim();
        let url = $(el)
          .find(".lchx > a")
          .attr("href")
          .replace(baseWebUrl, endpoint.chapter);

        chapter_list.push({ chapter, url });
      });

      result = {
        name,
        alternative,
        status,
        author,
        ilustrator,
        comic_type,
        //   theme,
        genre,
        sinopsis,
        chapter_list,
      };
    }

    return res.json({ statusCode: res.statusCode, result });
  })
);

router.get(
  `${endpoint.chapter}/:query`,
  asyncHandler(async (req, res) => {
    const response = await req.axios.get(encodeURI(req.params.query));
    let result = {};
    if (response.status == 200) {
      const $ = cheerio.load(response.data);
      let tmpTitle = $(".entry-title").text().trim();
      let match = /Komik(?<title>.*)Chapter(?<chapter>.*)/.exec(tmpTitle);
      if (match) {
        let { title, chapter } = match.groups;

        let image = [];
        $(".imgch > #chimg > img").each((i, el) => {
          image.push($(el).attr("src"));
        });

        result = { title: title.trim(), chapter: chapter.trim(), image };
      }
    }

    /** cache-control */
    res.set("Cache-Control", "public, max-age=86400s");

    if (!result.title) res.statusCode = 404;
    return res.json({ statusCode: res.statusCode, result });
  })
);

router.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({
    title: `unable to handle this routes ${req.path}`,
    error: err.message,
  });
});

module.exports = router;
