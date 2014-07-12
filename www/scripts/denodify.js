(function(global) {
    
    if (global.denodify) return;
    
    var process = {
        platform: 'browser'
    };

    var __global = {};
    
    function error(type, arg1, arg2) {
        var msg;
        switch(type) {
          case 'resolve': 
            msg = 'Couldn\'t resolve module ' + arg1 + ' in ' + arg2; break;
          case 'route': 
            msg = 'No file with route ' + arg1 + ' found.'; break;
          case 'load': 
            msg = 'Module ' + arg1 + ' has not registered itself with denodify.'; break;
          case 'incomplete': 
            msg = 'Denodify knows nothing about a module with index ' + arg1; break;
        }
        throw Error(msg);
    }

    //from node path:
    function dirname(path) {
        var splitPathRe =
            /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    
        var result = splitPathRe.exec(path).slice(1),
            root = result[0],
            dir = result[1];

        if (!root && !dir) {
            // No dirname whatsoever
            return '.';
        }

        if (dir) {
            // It has a dirname, strip trailing slash
            dir = dir.substr(0, dir.length - 1);
        }

        return root + dir;
    };
    
    function require(index) {
        var module = m[index].m;
        if (module) return module.exports;
        var func = m[index].f;
        if (!func) error('load', m[index].route);
        func(
            function(moduleid) { //require
                var requiredIndex = requirerModuleIdIndex[index + moduleid];
                if (!requiredIndex) error('resolve', moduleid, m[index].filename);
                return require(requiredIndex);
            },
            module = m[index].m = {}, //module
            module.exports = {}, //exports
            m[index].filename,//__filename
            dirname(m[index].filename), //__dirname
            process, //process
            __global //global
        );
        return module.exports;
    }
    
    //###API

    //###denodify
    //Registers module with denodify on script load.
    global.denodify = function (func, index) { 
        var module = m[index];
        if (!module) error('incomplete', index);
        m[index].f = func;
    };
    
    //###require
    //Use this function to pull in or kickstart any defined nodejs modules from
    //outside nodejs modules. 
    global.denodify.require = function(route) {
        var index = routeIndex[route];
        if (!index) error('route', route);
        return require(index);
    };

    //###debug
    global.denodify.debug = function(__filename) {
        console.log('modules\n', m);
    };
    
    var m, routeIndex, requirerModuleIdIndex;
    

//module info
    var resolve = [];
})(this);
