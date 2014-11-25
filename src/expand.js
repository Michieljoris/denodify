var VOW = require('dougs_vow');
var Path = require('path');
var fs = require('fs-extra');

var makeScript = require('./make-script');
var modules;

var resolve = require('./resolve');
var containsModules;


var debug;


function trailWith(str, trail) {
    return str ? (str + (!endsWith(str, trail) ? trail : '')) : undefined;
};

function endsWith(str, trail) {
    return (str.substr(str.length-trail.length, str.length-1) === trail);
};
  

function insertScriptList(files, index, wwwPath, scriptPath, moduleId) {
    var vow = VOW.make();
    // console.log(moduleId);
    
    //make sure scriptPath is relative, not absolute
    resolve.resolve(wwwPath,Path.join('./', scriptPath, Path.dirname(moduleId)), Path.basename(moduleId), 
                  function(err, list) {
                      if (err) vow.breek(err);
                      else {
                          // files[index] = list.map(function(m) { return m.route; });
                          files[index] = list;
                          // console.log('found modules:\n', files[index]);
                          vow.keep(); }
                  }, false, debug); //tags, debug;
    return vow.promise;
}

// function processOneScriptBlock(wwwPath, sb, denodifyPath) {
function processOneScriptBlock(wwwPath, sb) {
    var vow = VOW.make();
    var vows = [];
    var files = sb.files;
    var index = 0;
    // console.log('Processing script block', sb);
    
    files.forEach(function(f) {
        //TODO to be autodetected later by being clever using recast, detective and caching
        //for now just indicate it is a module by clamping it within [ and ]
        if (typeof f !== 'string') { 
            containsModules = true;
            vows.push(insertScriptList(files, index, wwwPath, sb.path, f[0]));
        }
        else vows.push(VOW.kept(sb.files));
        index++;
    }); 
    if (!vows.length) vow.keep(sb);
    
    else VOW.every(vows).when(
        function() {
            var newList = [];
            // if (containsModules) newList.push(denodifyPath);
            files.forEach(function(f) {
                if (typeof f === 'string') newList.push(Path.join('/', sb.path || '', f));
                else {
                    f.forEach(function(f) {
                        modules.push(f);
                        var route = f.route;
                        // var ext = Path.extname(route);
                        // route = Path.dirname(route) + '/' + Path.basename(route, ext) + ext;
                        newList.push(route + (f.core ? '' : "?module=" + f.index));
                        // console.log(f);
                    });
                }
            }); 
            sb.files = newList;
            sb.path = '';
            vow.keep(sb);
        },
        function(err) {
            vow.breek(err);
        }
    );
    return vow.promise;
}

function deduplicate(blocks) {
    var listed = {};
    blocks.forEach(function(b) {
        b.files = b.files.filter(function(f) {
            var path = Path.join(b.path, f);
            var isDuplicate = listed[path];
            listed[path] = true;
            return !isDuplicate;
        });
    }); 
}

function expand(scriptBlock, wwwPath, isDebug) {
    var vow = VOW.make();
    debug = isDebug;
    containsModules = false;
    //make sure there is a denodify script in the scripts directory to load
    // console.log('------------------------------', wwwPath);
    var denodifyPath = Path.join(wwwPath, 'denodify.js');
    // try {
    //     fs.statSync(Path.resolve(denodifyPath));
    // } catch (e) {
    //     console.log('demodularify: scripts/denodify not found, adding one.'.red);
    //     fs.outputFileSync(Path.resolve(denodifyPath), makeScript());
    // } 
    var vows = [];
    modules = [];
    resolve.reset();
    scriptBlock.forEach(function(sb) {
        // vows.push(processOneScriptBlock(wwwPath, sb, Path.join(sb.path || '', 'denodify.js')));
        vows.push(processOneScriptBlock(wwwPath, sb));
    });
    VOW.every(vows).when(
        function(blocks) {
            deduplicate(blocks);
            if (containsModules) {
                blocks[0].files = ['/denodify.js'].concat(blocks[0].files);
                // console.log('writing denodify.js to ', denodifyPath, Path.resolve(denodifyPath));
                fs.outputFileSync(Path.resolve(denodifyPath), makeScript(modules, Path.resolve(wwwPath)));
            }
            vow.keep(blocks);
            // cb(null, blocks);
        },
        function(err) {
            vow.breek(err);
            // cb({ err: err}, scriptBlock);
        });
    return vow.promise;
}

module.exports = expand; 

// //----------------test----------------
// demodularify([
//     { id:'b1', path: 'somepath', files: ['a', 'b', 'c', ['modules/m1'], 'e', '/modules/m2', 'f']}
//     ,{ id:'b2', path: 'somepath', files: ['g', 'f', 'h', 'modules/m3', 'i', '/modules/m4', 'j']}
// ], Path.resolve('./test'), function(err, sb) {
//     if (err) console.log(err);
//     else console.log(sb);
// });
  
// var p = 'a/b/c/name.ext';
// console.log(Path.dirname(p));
// console.log(Path);
