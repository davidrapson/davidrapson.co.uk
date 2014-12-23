/*jshint node:true*/
'use strict';

var pkg = require('./package.json');

module.exports = {
    paths: {
        'static': 'assets',
        'styleSrc': 'assets/stylesheets',
        'styleDest': 'public/stylesheets',
        'jsSrc': 'assets/javascripts',
        'jsDest': 'public/javascripts',
        'build': 'public',
        'buildVersion': 'public/dist/' + pkg.version,
        'publicImages': '_site/images',
        'publicDist': '_site/public/dist'
    }
};
