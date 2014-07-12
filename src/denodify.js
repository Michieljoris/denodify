var Path = require('path');
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
  
var prefix = "denodify(function(require,module,exports,__filename,__dirname,process,global){\n";
var postfix = "},moduleid);";

exports.wrap = function(moduleid, string) {
    if (string[0] === '\n') string = string.slice(1);
    //TODO add extra info about file here:
    // var newPrefix = prefix.replace(/moduleid/g, moduleid);
    var newPostfix = postfix.replace(/moduleid/g, moduleid);
    return prefix + string + newPostfix;
};

//###script
  
//Script to load in your html file before all denodified scripts.
  
//Takes one argument: an object? or array? of resolve info on modules used on the client. 
//This gets added to the nodify script's closure. 
exports.script = require('./make-script');

//###resolve

//Given a main `module`, parses it for require calls, loads the corresponding
//module files and recursively parses them. Once all dependencies are found
//calls the `callback` with a list of tags that if loaded in the browser in the
//listed order all dependencies would be fullfilled for each module.

//* `www` : the directory the server's root.
//* `parent` : the path from `www` to the main module
//* `module` : the id of the file if you were requiring it (without the js)
//* `callback` : called as `callback(err, list)`. 
//* `tags` : return list of src files wrapped in tags
// Returns a list of file names to add to a html file in script tags.
// exports.resolve = require('./resolve').resolve;

//###expand
  
//Takes a list of script files and 'expands' any entry of a module to a list of
//its recursive dependencies and the module itself. At the moment module
//detection is done through a marking of the module file name by enclosing it in
//[ and ].
  
//TODO
//expand could detect modules by parsing them using detective.
//add config: 
//at the moment this is specifically written for html-builder. It needs to be made more general and html-builder will have to be adapted.
// function expand(scriptBlock, wwwPath, cb, isDebug) {
  
exports.expand = require('./expand');
