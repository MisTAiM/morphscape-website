(function() {
    var el = document.getElementById('server-status');
    if (!el) return;

    fetch('/api/status')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.online) {
                el.className = 'server-status online';
                var suffix = '';
                if (typeof data.count === 'number') {
                    suffix = data.count > 0
                        ? ' &middot; ' + data.count + (data.count === 1 ? ' player online' : ' players online')
                        : ' &middot; No one online right now';
                }
                el.innerHTML = '<span class="dot"></span>Server Online' + suffix;
            } else {
                el.className = 'server-status offline';
                el.innerHTML = '<span class="dot"></span>Server Offline';
            }
        })
        .catch(function() {
            el.className = 'server-status offline';
            el.innerHTML = '<span class="dot"></span>Unable to check status';
        });
})();
