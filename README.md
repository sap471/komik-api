# ntabz_komik

API untuk mencari bermacam komik bahasa indonesia. dibuat dengan kode yang _**to the point**_ sangat-sangat simple.

bahasa yang digunakan adalah javascript, karena saya tidak suka yang ribet-ribet. jadi cuman saya buat 2 file, sebenernya bisa 1 cuman nanti malah bingung sendiri :D

> untuk beberapa alasan, script ini hanya work jika menggunakan IP Indonesia :)

## usage

```
git clone
npm install
npm run start
```

## api endpoint

| endpoint        | penjelasan                   |
| --------------- | ---------------------------- |
| /populer        | list komik terpopuler        |
| /manhua         | komik china                  |
| /manhwa         | komik korea                  |
| /search/{query} | endpoint untuk mencari komik |
| /detail/{title} | detail dari komik            |
| /ch/{chapter}   | chapter episode di komik     |
