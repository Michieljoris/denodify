denodify
--------

Organize javascript on the browser using the nodejs module system.


Much simpler version than browserify, modules don't get bundled for instance,
nor is there any plugin system browserifying all and sundry. Instead
[html-builder](http://github.com/Michieljoris/html-builder) and
[bb-server](http://github.com/Michieljoris/bb-server) enable bundling and
transforming files.

Install:

    npm install denodify

Add to your module:

    var denodify = require('denodify');

Use:

See [documentation](https://rawgithub.com/Michieljoris/denodify/master/docs/denodify.html).


TODO:
* write tests
* Wrap function should be able to read files as well
* Wrap streams
* Wrap in other languages than just javascript
* Add standard nodejs modules such as path and url (see browserify)
* Implement use of deputy for caching detective investigations

