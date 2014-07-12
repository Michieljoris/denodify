var fs = require('fs-extra');

function makeScript(modules) {
    modules = modules || [];
    //TODO process list so that only relevant info is added.
    //For instance replace requires and filenames with ids?
    var byIndex = {};
    var byId = {};
    modules.forEach(function(m) {
        if (m.core) byIndex[m.ids[0]] = m;
        else byIndex[m.index] = m;
        if (m.ids) 
            m.ids.forEach(function(id) {
                byId[id] = byId[id] || [];
                byId[id].push(m);
            });
        
    });
    modules.forEach(function(m) {
        m.resolve = {};
        if (m.deps) {
            m.deps.forEach(function(d) {
                if (byId[d]) {
                    if (byId[d].length > 1) {
                        m.resolve[d] = (function() {
                            var f;
                            byId[d].some(function(e) {
                                f = e;
                                return e.requirers && e.requirers.indexOf(m.filename) !== -1;
                            });
                            return f.index;
                        }());
                    }
                    else { m.resolve[d] = byId[d][0].core ? d :  byId[d][0].index; }
                } 
            });
        } 
    });
    console.log('Byid:\n', byId);
    console.log('By index:\n', byIndex);
    
    var m = {};
    Object.keys(byIndex).forEach(function(k) {
        m[k] = { filename: byIndex[k].route, resolve: byIndex[k].resolve };
    });
    console.log(m);
    var script = fs.readFileSync(__dirname + '/denodify-browser.js');
    script = script.slice(0, script.length-10) + 
        '\n//module info' + 
        '\n    var m = ' + JSON.stringify(modules.byIndex) + ';' + 
        '\n})(this);\n';
    return script;
}
  
module.exports = makeScript; 


// modules= {
//     byIndex: { 1: { filename: "scripts/modules/path/to/module" }},
//     byResolveId: { "path/to/module": m[1] }
// }

