var Path = require('path');
var required = require('./required');
var fs = require('fs-extra');
require('colors');
var debugMode;

var crypto = require('crypto');

var modules;
var index;



//same id, same file, different requirers
//same id, different file, different requirers

//same id, same file, same requirer //all the time

//different id, different file, different requirers //all the time
//different id, different file, same requirer //all the time

//different id, same file, different requirers //possible but rare
//different id, same file, same requirer //rare but possible

//same id, different file, same requirer //not possible

function pushSet(arr, el) {
    arr = arr || [];
    if (arr.indexOf(el) === -1)  arr.push(el);
    return arr;
}

function reset() {
    modules = [];
    index = 0;
}

function getList(module) {
   //TODO!! modules has to be emptied for every build run of demodularify TODO!!!! 
   //TODO!! node_modules_index has to be zerod for every build run of demodularify TODO!!!! 
    var path = [];

    function walk(module) {
        if (module.core) {
            //the id does -NOT- start with '.', '..' or '/'
            //so doesn't clash with any relative require ids
            //these will have to be supplied by the server!!
            modules[module.id] = module;
            return;
        }
        if (module.walked) return;
        modules[module.filename] = module;
        path.push(module.id);
        module.walked = true;
        module.index = -1;
        module.deps.forEach(function(d) {
            var dep_id = d.id;
            d = modules[d.filename] || d;
            d.requirers = pushSet(d.requirers, module.filename);
            d.ids = pushSet(d.ids, dep_id);
            
            walk(d); 
            if (d.index < 0) {
                var str = "Module " + module.id + " is dependent on module " + d.id +
	            '. However, module ' + d.id + ' is also directly or indirectly dependent on module ' +
	            module.id + ".\nDependency path to this point: \n" + path.join(' relies on \n') +
	            ' relies on ' + d.id;
                console.log(str.red);
            }
        });
        module.index = index++;
        path.pop();
    }
    walk(module);
    return modules;
}

function endsWith(str, trail) {
    return (str.substr(str.length-trail.length, str.length-1) === trail);
};
  
function trailWith(str, trail) {
    return str ? (str + (!endsWith(str, trail) ? trail : '')) : undefined;
};

function resolve(www, parent, id, cb, tags, isDebug) {
    // console.log('-------------------', www, parent);
    debugMode = isDebug;
    try 
    {  www = Path.resolve(www);
       parent = Path.resolve(www, parent);
       console.log('Resolving: ' + id + ' in directory ' + parent);
       
       var fileName = Path.resolve(parent, trailWith(id, '.js'));
       try {
           fs.statSync(fileName);
       } catch(e) { cb(e,null);
                    return;}
       required(fileName, {
           includeSource: false,
           ignoreMissing: function(name, parent) {
               var out =  name + ' in ' + parent;
               console.log('Missing module:'.red.bold, out.yellow);
           }
           // resolve: ..
       }, function(err, deps) {
           if (err) {
               cb(err, null);
               // throw err;
           }
           else { 
               var modules = getList(
                   {   id: id,
	               filename: fileName, 
	               deps: deps,
	               index: -1
                   }
               );
               
               var list = Object.keys(modules).map(function(m) {
                   m = modules[m];
                   if (m.core) {
                       m.route = '/_core_modules/' + m.id;
                   }
                   else {
	               var startWithWwwPath = m.filename.indexOf(www) === 0;
	               if (!startWithWwwPath) {
                           var hash = crypto.createHash('md5').update(m.filename).digest('hex');
                           m.route = '/_node_modules/' + hash + '_' +  Path.basename(m.filename);
                           m.lib = true;
                           // m.route = m.filename;
                           //TODO set softlinks to filename in www/node_modules dir
                           //possibly do deduplication?
                           // console.log( 'Warning: ' + m.id  + ' was found outside the www directory (' + www + ')');
                       }
                       else m.route = m.filename.slice(www.length); 
                       
                       m.deps = m.deps.map(function(d) { return d.id; });
                   }
                   // debug('module:',m);
                   delete m.id;
	           return m;
               }).sort(function(a, b) {
	           return a.index > b.index;
               }).map(function(m) {
                   return !tags ?
                       m : 
                       // { id: m.id, route: m.route, filename: m.filename } :
                   "<script type=\"text/javascript\" src=\"" + m.route + "\"></script>";
               });
               // debug('Debug:\n', list);
               cb(null, list); 
           }
       });
    } catch(e) {
        cb(e, null);
    }
};

function debug() {
    if (debugMode) console.log.apply(console, arguments);
}

module.exports = {
    resolve: resolve,
    reset: reset
    
};


// console.log(exports.script.toString());

// list('../', './test', './m3', function(err, tags) {
//     console.log();
//     console.log(tags);
// }, true);

