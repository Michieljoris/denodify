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
    var m = {
	"0": {
		"filename": "_node_modules/4bd10815af51e05c24610fa9eebcd61e_lru_cache.js",
		"resolve": {}
	},
	"1": {
		"filename": "_node_modules/c02afedfec0c3a9915d363bbd1cb35e9_arc_cache.js",
		"resolve": {
			"./lru_cache": 0
		}
	},
	"2": {
		"filename": "_node_modules/7756b74302bfc6987811e10f5b100eae_cachejs.js",
		"resolve": {
			"./lib/lru_cache": 0,
			"./lib/arc_cache": 1
		}
	},
	"3": {
		"filename": "b1.js",
		"resolve": {}
	},
	"4": {
		"filename": "scripts/b1.js",
		"resolve": {
			"cachejs": 2,
			"../b1": 3
		}
	},
	"5": {
		"filename": "scripts/modules/r1.js",
		"resolve": {
			"../b1": 4
		}
	},
	"6": {
		"filename": "scripts/modules/mymodule.js",
		"resolve": {
			"url": "url",
			"./r1": 5,
			"cachejs": 2,
			"../b1.js": 4,
			"../b1": 4
		}
	},
	"url": {
		"filename": "__api/core_module/url",
		"resolve": {}
	}
};
})(this);
