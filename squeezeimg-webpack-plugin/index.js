const path = require('path');
const request = require('request');
const { scrapingPathFiles, readFile, writeFile, existOrAddDir } = require('./helpers')


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
                      reject(err);
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
                      reject(new Error(res.error || res.message || str));
                    }
                    count--;
                    if (count === 0) resolve();
      
                  });
                  let data = readFile(file);
                  let formData = req.form();
                  formData.append('file_name', file.split('/').pop());
                  formData.append('qlt', options.qlt || 60);
                  formData.append('token', options.token);
                  formData.append('method', options.method || 'compress');
                  formData.append('file', data, { filename: file.split('/').pop() });
                  formData.append('to', options.to || 'webp');
                })
              }
            } 
          } catch (err) {
              console.log(`${PLUGIN_NAME} error : ${err}`);
          }
      })
    }
};