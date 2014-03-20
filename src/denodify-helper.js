var Path = require('path');
var required = require('required');
var fs = require('fs-extra');

var path = [];
var index = 0;
var modules;

// var script = "var qdn=qdn||{require:function(module) {return qdn.m[module].exports;},m:{}};";

// var prefix = "(function(require, module, exports, __filename, __dirname, process) {\n";
// var postfix = "\n\n})(function(id){return qdn.require(id,'module')},qdn.m['module']={exports:{}}, qdn.m['module'].exports, 'module', '__dirname', qdn.process);";

var prefix = "denodify('replace',function(require, module, exports, __filename, __dirname, process) {";
var postfix = "});";

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
    console.log('in nodify.wrap', moduleid);
    if (string[0] === '\n') string = string.slice(1);
    var newPrefix = prefix.replace(/replace/g, Path.join('/', moduleid));
    // postfix = postfix.replace(/__dirname/, Path.dirname(module));
    return newPrefix + string + postfix;
};

//###script

//Script to load in your html file before all denodified scripts.
exports.script = fs.readFileSync('./denodify.js');

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

function walk(module) {
  modules[module.id] = module;
  path.push(module.id);
  module.index = -1;
  module.deps.forEach(function(d) {
    d = modules[d.id] || d;
    if (d.index === undefined) walk(d); 
    else if (d.index < 0) {
      throw "Module " + module.id + " is dependent on module " + d.id +
	'. However, module ' + d.id + ' is also directly or indirectly dependent on module ' +
	module.id + ".\nDependency path to this point: \n" + path.join(' relies on \n') +
	' relies on ' + d.id;
    }
  });
  module.index = index++;
  path.pop();
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
       debug('Resolving: ' + id + ' in directory ' + parent);
       var fileName = Path.resolve(parent, trailWith(id, '.js'));
       try {
       fs.statSync(fileName);
       } catch(e) { cb(e,null);
                    return;}
       
       required(fileName, {
           includeSource: false
       }, function(err, deps) {
           if (err) throw err;
           else { 
               
               modules = [];
               walk({
	           id: id,
	           filename: fileName, 
	           deps: deps,
	           index: -1
               });
               var list = Object.keys(modules).map(function(m) {
                   m = modules[m];
	           var startWithWwwPath = m.filename.indexOf(www) === 0;
	           if (!startWithWwwPath)
                       throw 'Warning: ' + m.id  + ' was found outside the www directory (' + www + ')';
                   m.route = m.filename.slice(www.length); 
                   debug('module:',m);
	           return m;
               }).sort(function(a, b) {
	           return a.index > b.index;
               }).map(function(m) {
                   return listOnly ?
                       { id: m.id, route: m.route, filename: m.filename } :
                   "<script type=\"text/javascript\" src=\"" + m.route + "\"></script>";
               });
               debug('Debug:\n', list);
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



// list('../', './test', './m3', function(err, tags) {
//     console.log();
//     console.log(tags);
// }, true);