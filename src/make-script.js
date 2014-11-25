var fs = require('fs-extra');
var Path = require('path');

//Returns a string with the javascript code (denodify-browser.js) that needs to
//be loaded in any web app that uses denodify-wrapped nodejs modules,

//Pass in the list of modules with their dependencies and requirers as produced
//by denodify.expand. A key value object is added to denodify-browser so that it
//can resolve the require calls in any module.

function makeScript(modules, wwwPath) {
    modules = modules || [];
    var byIndex = {};
    var byId = {};
    
    //A module looks like this:
    // { filename: '/home/michieljoris/mysrc/javascript/denodify/www/scripts/b1.js',
    //   deps: [ 'cachejs', '../b1' ],
    //   requirers: 
    //   [ '/home/michieljoris/mysrc/javascript/denodify/www/scripts/modules/r1.js',
    //     '/home/michieljoris/mysrc/javascript/denodify/www/scripts/modules/mymodule.js' ],
    //   ids: [ '../b1', '../b1.js' ],
    //   walked: true,
    //   index: 4,
    //   route: 'scripts/b1.js',
    //   resolve: { cachejs: 2, '../b1': 3 } },
    //as produced by expand.
    
    
    //Two new maps are extracted from this list of modules, one by index, and
    //the other by id. One id can refer to different files so this needs to be
    //untangled. These maps will help doing this.
    modules.forEach(function(m) {
        if (m.core) byIndex[m.ids[0]] = m;
        else byIndex[m.index] = m;
        if (m.ids) 
            m.ids.forEach(function(id) {
                byId[id] = byId[id] || [];
                byId[id].push(m);
            });
        
    });
    
    //By going through all the modules once more, a new field can be added to
    //every module that resolves every dependency (as in require('dependency'))
    //to the proper file
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
    // console.log('Byid:\n', byId);
    // console.log('By index:\n', byIndex);
    
    //we need to make the softlinks for the lib modules that were requiredk
    Object.keys(byIndex).forEach(function(k) {
        // console.log(inde);
        var m = byIndex[k];
        if (m.lib) {
            var softlink = Path.join(wwwPath, m.route);
            console.log('Making sure path to softlink exists; ',
                        Path.dirname(softlink));
            console.log('Making softlink:\n',softlink + ' --> ' +
                        m.filename);
            try {
                fs.mkdirpSync(Path.dirname(softlink));
                fs.symlinkSync(m.filename, Path.join(wwwPath, m.route) );
            }
            catch(e) {
                if (e.code === 'EEXIST') console.log('>>>> Softlink already exists');
                else console.log(e);
            }
        }
    });
    // console.log(modules);
    
    //strip the modules to the essentials:
    var stripped = {};
    Object.keys(byIndex).forEach(function(k) {
        stripped[k] = { filename: byIndex[k].route, resolve: byIndex[k].resolve };
    });
    
    // console.log(stripped);
    //get the template:
    var script = fs.readFileSync(__dirname + '/denodify-browser.js');
    
    //add the modules data:
    script = script.slice(0, script.length-10) + 
        '\n//module info' + 
        '\n    var m = ' + JSON.stringify(stripped, null, '\t') + ';' + 
        '\n})(this);\n';
    return script;
}
  
module.exports = makeScript; 
