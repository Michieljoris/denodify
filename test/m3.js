var m2 = require('./m2');
console.log(m2);

setTimeout(function() {
    var again = require('./m2');
    console.log(again);
    
},200);
