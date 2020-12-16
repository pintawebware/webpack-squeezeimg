const path = require('path');
const fs = require('fs');


scrapingPathFiles = (path) => {
    let filesPath = [];
    let files = fs.readdirSync(path);
    for(let file of files ) {
        let pathFile = `${path}/${file}`;
       if(fs.statSync(pathFile).isDirectory()) {
        filesPath = filesPath.concat( scrapingPathFiles(pathFile))
       } else {
        filesPath.push(pathFile);
       }
    }
    return filesPath;
}, 

module.exports = {

    scrapingPathFiles,

    existOrAddDir : (path) =>{
        if(!fs.existsSync(path)){ 
            fs.mkdirSync(path);
        }
    },

    readFile : (path) => {
        return Buffer.from(fs.readFileSync(path), 'binary');
    },

    writeFile : (path, data) => {
        
        return fs.writeFileSync(path, Buffer.from(data, 'binary'));
    },

}