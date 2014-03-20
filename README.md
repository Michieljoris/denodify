denodify
--------

Working, but needs testing...

Organize javascript on the browser using the nodejs module system.

Much simpler version than browserify, modules don't get bundled for instance,
nor is there any plugin system browserifying all and sundry. 

Install:

    npm install denodify
	
This will also install a demo server. Run

    node server/server.js
	
to see denodify in action.

Use:

Add `src/denodify.js` to your sites javascript directory and load the file on
your web page.

Wrap your javascript:

    denodify('my_module_id',function(require, module, exports, __filename, __dirname, process) {"
		require('another_module');
        [more source code]
	    module.exports = { bla: 123 }
    })
	
Load your module and its dependencies with:

    var exported = denodify.require('my_module_id); // { bla: 123 }
	
The order in which you load your nodejs modules doesn't matter as long as they
are all loaded by the time you make your denodify.require call.

If you identify modules by their path from the server's root directory, and
start paths with a slash, you can require files within the same directory with
relative paths, just as in nodejs.

You can already do `require('path')` since I use it to resolve paths in
denodify.

I will add more standard nodejs modules as I see a need for them, url for
instance

You should be able to add any nodejs module as long as it doesn't use any
specific server side technology, such as file io for instance.

I use this with [html-builder](http://github.com/Michieljoris/html-builder) and
[bb-server](http://github.com/Michieljoris/bb-server). I can add a module and
the proper script tags for all dependencies get inserted and the source gets
automatically wrapped with the proper modules ids. This should even work if I
write a module in a language other than javascript but supported by
bb-server. The combination of denodify with the server and builder in effect
achieves the same goal as all the browserify plugins, however for development
purposes the files don't need to get bundled and then source mapped since they
can stay separate. Bb-server automatically concatenates (and minifies and gzips
and caches) all source files and modules (including ones that need to be
transpiled) in production mode.

`src/denodify-helper` is a nodejs file that provides some functions to wrap
source code and to get a list of dependencies for a given module file. It
returns the list ordered by dependency resolution (superfluous) and gives a
warning when it detects a circular dependency. If modules relied directly on
each other the order would matter, but a loaded file only registers its source
code and that can happen in any order as long as it happens before the
denodify.require call.

Add denodify-helper to your module:

    var denodify = require('denodify');


This is a very simple, but quite effective system, much better and easier than
the old script injecting libraries like require.js or my own
[bootstrapjs](http://github.com/Michieljoris/bootstrapjs). And you get nodejs
module compatibility for free.

See also [source documentation](https://rawgithub.com/Michieljoris/denodify/master/docs/denodify.html).

TODO:
* write tests
* Add standard nodejs modules such as url (see browserify)
* Implement use of deputy for caching detective investigations

