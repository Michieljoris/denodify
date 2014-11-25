
console.log('in module t2');
setTimeout(function() {
    module.exports = "exported from module t2";
},100);
