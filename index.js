/**
 * Created by liangjianfeng on 2017/7/15.
 */

const Koa = require('koa');
const app = new Koa();
const serve = require('koa-static');
const compress = require('koa-compress')
const config = require('./config');
const fs = require('fs');

app.use(compress({
  filter: function(content_type) {
    return /javascript/i.test(content_type)
  },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))

app.use(serve(__dirname + '/static/js'));

app.use(serve(__dirname + '/static/img'));

app.use(serve(__dirname + '/static/html'));

app.use(serve(__dirname + '/static/json'));

app.listen(config.port, () => console.log(`http://localhost:${config.port}/`));