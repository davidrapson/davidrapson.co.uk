(function() {

    function getJson(url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                var data = JSON.parse(request.responseText);
                callback.call(this, data);
            }
        };
        request.send();
    }

    function buildTemplate(data) {
        return [
            '<ul class="link-list u-list-unstyled">',
                data.map(function(item) {
                    return [
                        '<li>',
                            '<a href="' + item.href + '" class="u-link-external">',
                                item.description,
                            '</a>',
                        '</li>'
                    ].join('');
                }).join(''),
            '</ul>'
        ].join('');
    }

    var apiUrl = 'https://davidrapson-pinboard-proxy.herokuapp.com/?tag=professional-cannon';
    getJson(apiUrl, function(data) {
        var tmpl = document.querySelector('.js-pinboard');
        var html = buildTemplate(data);
        if (tmpl && html) {
            tmpl.innerHTML = html;
        }
    });

}());
