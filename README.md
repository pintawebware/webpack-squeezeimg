# squeezeimg webpack

The Webpack Squeezeimg plugin is destined to optimize unlimited images without any visible loss in quality.


Using the Webpack Squeezeimg plugin you can easily minify the size of all your images, speed up loading of your websites and applications.


You can compress your images of such formats - .png, .jpg/.jpeg, .gif, .svg, .bmp, .tiff.


Also plugin allows you to convert your images to webP and jp2 format.


Try the plugin functions right now. To do this, go to https://squeezeimg.com/.

## Install

```sh
$ npm install --save-dev webpack-squeezeimg
```


## Usage
 
```js
const SqueezeimgPlugin = require("webpack-squeezeimg");

module.exports = {
    plugins: [new SqueezeimgPlugin({
        src: 'images/',
        dest: 'tmp/',
        token: 'Your API token',
        qlt: 60,
        method: 'convert',
        to: 'webp',
        rename: true,
    })]
};
```

## API

### squeezeimg(option)

#### Options Object
### src 
 Path to the directory with images from the project directory.  
### dest 
 Target directory path from project directory. 
### token : 
 'Your API token', https://squeezeimg.com/
### qlt :
 Quality precentage (max 80), default 60
### method : 
 Method selection convert or compress', default 'compress'
### to
convert to format ( jp2, webp ) default 'webp'
### rename 
rename image, default false  ( If true, the file name is assigned by the server )

### License MIT License (c) PintaWebware