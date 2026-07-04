(function() {
    var el = document.getElementById('server-status');
    if (!el) return;

    fetch('/api/status')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.online) {
                el.className = 'server-status online';
                el.innerHTML = '<span class="dot"></span>Server Online';
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
