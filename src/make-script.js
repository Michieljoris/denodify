var fs = require('fs-extra');

function makeScript(list) {
    list = list || [];
    //TODO process list so that only relevant info is added.
    //For instance replace requires and filenames with ids?
    var script = fs.readFileSync(__dirname + '/denodify-browser.js');
    script = script.slice(0, script.length-10) + 
        '\n//module info' + 
        '\n    var resolve = ' + JSON.stringify(list) + ';' + 
        '\n})(this);\n';
    return script;
}
  
module.exports = makeScript; 
