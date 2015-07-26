(function() {

    if(!(
        'performance' in window &&
        'addEventListener' in window &&
        typeof Array.prototype.forEach !== 'undefined'
    )) {
        return;
    }

    window.addEventListener('load', function() {
        var marks = window.performance.getEntriesByType("mark");
        var logMarks = {};
        marks.forEach(function(mark) {
            var time = Math.round(mark.startTime);
            var splitName = mark.name.split('.');
            if (time >= 0 && time < 3600000 && window.ga) {
                ga('send', {
                  'hitType': 'timing',
                  'timingCategory': 'mark',
                  'timingVar': splitName[0],
                  'timingValue': time,
                  'timingLabel': splitName[1],
                  'page': window.location.pathname
                });
            }
        });
    }, false);

})();
