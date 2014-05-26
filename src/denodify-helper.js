var Path = require('path');
var required = require('required');
var fs = require('fs-extra');
require('colors');
var prefix = "denodify('replace',function(require,module,exports,__filename,__dirname,process){\n";
var postfix = "});";
var modules = [];
var node_modules_index = 0;

//Utility functions to enable use of nodejs modules in the browser. Used in
//[html-builder](http://github.com/Michieljoris/html-builder) and
//[bb-server](http://github.com/Michieljoris/bb-server).

//###wrap

//Wrap a `string` of a nodejs module with the proper code to enable its use in
//the browser. Specify the `language` your nodejs module is written in to match
//the added code to the code of the module. Defaults to javascript.

//If you leave 2 lines open at the top of every module wrap will replace the top
//line with the prefix wrapping code. This way line numbers in your modules will
//match the line numbers of the javascript file loaded in the browser
exports.wrap = function(moduleid, string) {
    if (string[0] === '\n') string = string.slice(1);
    var newPrefix = prefix.replace(/replace/g, Path.join('/', moduleid));
    return newPrefix + string + postfix;
};

//###script

//Script to load in your html file before all denodified scripts.
exports.script = fs.readFileSync(__dirname + '/denodify.js');

//###tags

//Given a main `module`, parses it for require calls, loads the corresponding
//module files and recursively parses them. Once all dependencies are found
//calls the `callback` with a list of tags that if loaded in the browser in the
//listed order all dependencies would be fullfilled for each module.

//Callback is called with an error if a circular dependency is found or a
//dependency is found that is not in the `www` directory, or if any other error
//occurs.

//* `www` : the directory the server's root.
//* `parent` : the path from `www` to the main module
//* `module` : the id of the file if you were requiring it (without the js)
//* `callback` : called as `callback(err, list)`. 
// Return a list of script tags to add to a html file. 
exports.tags = function(www, parent, module, callback, listOnly) {
    list(www, parent, module, callback, false);
}; 

//###list

//Same as tags, however returns only the properly ordered list of module ids and
//corresponding file names.
exports.list = function(www, parent, module, callback, listOnly) {
    list(www, parent, module, callback, true);
}; 

exports.debug = false;


//same id, same file, different requirers
//same id, different file, different requirers

//same id, same file, same requirer //all the time

//different id, different file, different requirers //all the time
//different id, different file, same requirer //all the time

//different id, same file, different requirers //possible but rare
//different id, same file, same requirer //rare but possible

//same id, different file, same requirer //not possible


function getList(module) {
   //TODO!! modules has to be emptied for every build run of demodularify TODO!!!! 
   //TODO!! for every build run of demodularify TODO!!!! 
    // var path = [];
    var index = 0;

    function walk(module) {
        if (module.core) {
            modules[module.id] = module;
            return;
        }
        if (module.walked) return;
        modules[module.filename] = module;
        // path.push(module.id);
        module.walked = true;
        // module.index = -1;
        module.deps.forEach(function(d) {
            d = modules[d.filename] || d;
            d.requirers = d.requirers || [];
            d.requirers.push(module.filename);
            // if (d.index === undefined) walk(d); 
            walk(d); 
            // else if (d.index < 0) {
            //     var str = "Module " + module.id + " is dependent on module " + d.id +
	    //         '. However, module ' + d.id + ' is also directly or indirectly dependent on module ' +
	    //         module.id + ".\nDependency path to this point: \n" + path.join(' relies on \n') +
	    //         ' relies on ' + d.id;
            //     // console.log(str.red);
            // }
        });
        module.index = index++;
        // path.pop();
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

function list(www, parent, id, cb, listOnly) {
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
           if (err) throw err;
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
	           var startWithWwwPath = m.filename.indexOf(www) === 0;
	           if (!startWithWwwPath) {
                       m.route = 'node_modules/' + node_modules_index++ + '_' +  Path.basename(m.filename);
                       //TODO set softlinks to filename in www/node_modules dir
                       // console.log( 'Warning: ' + m.id  + ' was found outside the www directory (' + www + ')');
                   }
                   else m.route = m.filename.slice(www.length); 
                   m.deps = m.deps.map(function(d) { return d.id; });
                   // debug('module:',m);
	           return m;
               }).sort(function(a, b) {
	           return a.index > b.index;
               }).map(function(m) {
                   return listOnly ?
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
    if (exports.debug) console.log.apply(console, arguments);
}


// console.log(exports.script.toString());

// list('../', './test', './m3', function(err, tags) {
//     console.log();
//     console.log(tags);
// }, true);
