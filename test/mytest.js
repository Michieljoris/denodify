var denodify = require('../src/denodify');

// denodify.debug = true;
denodify.tags('./', './', './m3', function(err, tags) {
    console.log();
    console.log(tags);
});

var wrapped = denodify.wrap('mymodule', '\n\n[some nodejs module code]');
console.log(wrapped);

// var qdn=qdn||{require:function(module) {return qdn.m[module].exports;},m:{}};
// //=============module t1===============
// (function(require, module, exports) { 
    
//     // module.someValue = "Some value in module t1";
//     // module.exports = "This is module t1";
//     exports.bla = "exports obj from module t1";
    
// })(qdn.require, qdn.m['./t1']={exports:{}}, qdn.m['./t1'].exports);
// //================== 
    
// //=============module t2=================
// (function(require, module, exports) { 
    
//     var t1 = require('./t1');
//     console.log(t1);
//     module.exports = "exported from module t2";
    
// })(qdn.require, qdn.m['./t2']={exports:{}}, qdn.m['./t2'].exports);

// //================== 

// //=============module t3=================
// (function(require, module, exports) { 
    
//     var t1 = require('./t1');
//     var t2 = require('./t2');
//     console.log(t1);
//     console.log(t2);
    
// })(qdn.require, qdn.m['./t3']={exports:{}}, qdn.m['./t3'].exports);

// //================== 





//test
// var parent = '';
// var id = './t3';
// list('/home/michieljoris/tmp/quick-denodify/realmodules/test', parent, id);
