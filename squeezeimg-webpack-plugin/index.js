const path = require('path');
const request = require('request');
const { scrapingPathFiles, readFile, writeFile, existOrAddDir } = require('./helpers')
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
 
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: 'error',
  format: combine(
      timestamp(),
      myFormat
  ),
  transports: [
      new transports.Console(),
      new transports.File({
          filename: path.join(__dirname, 'error.log'),
          level: 'error',
      })
  ],
  handleExceptions : true,
  colorize: true,
  exitOnError: false
});


const PLUGIN_NAME = 'webpack-squeezeimg'
const URL = 'https://api.squeezeimg.com/plugin'; 
const EXTENSIONS = ['.jpg', '.png', '.svg','.jpeg' ,'.jp2','.gif','.tiff','.bmp','.PNG','.JPEG','.GIF','.SVG','.TIFF','.BMP',];



module.exports = class SqueezeimgWebpackPlugin {
    constructor(options) {
      this.options = options;
    }
    apply(compiler) {
      compiler.hooks.done.tap("SqueezeimgWebpackPlugin", async (stats) => {
        let options = this.options;
        try {
            if (!options.token) {
              throw new Error(`${PLUGIN_NAME}  error : Not token options`);
            }
            let count = 0;
            let dest = path.resolve(compiler.options.context, options.dest || '')
            let files = scrapingPathFiles(path.resolve(compiler.options.context, options.src || ''));
            existOrAddDir(dest);
            for(let file of files) {
              if (EXTENSIONS.includes(`.${file.split('.').pop()}`)) {
               await new Promise((resolve, reject) => {
                  count++;
                  console.log(`${PLUGIN_NAME} processes : ${file}`);
                  let req = request.post({ url: URL, encoding: 'binary' }, (err, resp, body) => {
                    if (err) {
                      logger.error(`${PLUGIN_NAME} error : ${err.message}`)
                    } else if (resp.statusCode === 200) {
                      let filename = file.split('/').pop();
                      if (options.rename) {
                        filename = resp.headers["content-disposition"].split('=').pop().replace(/"/g, '');
                      }
                      filename = filename.replace(path.extname(filename), path.extname(resp.headers["content-disposition"].split('=').pop().replace(/"/g, '')));
                      writeFile(`${dest}/${filename}`,body);
      
                    } else if (resp.statusCode !== 504) {
                      let str = Buffer.from(body, 'binary').toString();
                      let res = {};
                      try {
                        res = JSON.parse(str);
                      } catch (err) { }
                      logger.error(`${PLUGIN_NAME} error : ${res.error.message || res.message || str}`)
                    }
                    resolve();
                  });
                  let data = readFile(file);
                  let formData = req.form();
                  formData.append('file_name', file.split('/').pop());
                  formData.append('qlt', options.qlt || 60);
                  formData.append('token', options.token);
                  formData.append('source', "Plugin : Web-Pack");
                  formData.append('method', options.method || 'compress');
                  formData.append('file', data, { filename: file.split('/').pop() });
                  formData.append('to', options.to || 'webp');
                })
              }
            } 
          } catch (err) {
            logger.error(`${PLUGIN_NAME} error : ${err.message}`);
          }
      })
    }
};