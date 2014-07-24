// var url = require('url');
// console.log(url);
global.bla = 'this is a global';
//------------------------
var r1export = require('./r1');
// require('globalmodule');
var cachejs = require('cachejs');
// console.log(cachejs);
var b1 = require('../b1.js');
var b2 = require('../b1');
// console.log('b1 export is:', b1);
//blabla
console.log('r1export = ',r1export);
console.log(__dirname, __filename );
//----------------------------

console.log(require.cache);
