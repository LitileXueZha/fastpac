'use strict';

var d = {"Whitelist":{"URL":["http://example.org/path-1"],"Host":{"org":{"example":{"list":{"white":null}}}}},"Proxy":{"URL":["https://example.org/path-2","https://example.org/path-2"],"Host":{"org":{"example":null}}}};
function findInURL(url, URLs, i) {
    var max = URLs.length;
    if (i === max) {
        return false;
    }
    if (url.length > max) return findInURL(url, URLs, i + 1);
    for (var j = 0; j < max; j ++) {
        if (url[j] !== URLs[i][j]) {
            return findInURL(url, URLs, i + 1);
        }
    }
    return true;
}
function findInHost(labels, tree, i) {
    var found = labels[i] in tree;
    if (i === 0) {
        return found;
    }
    if (found) {
        tree = tree[labels[i]];
        if (tree) return findInHost(labels, tree, i - 1);
    }
    return false;
}
function FindProxyForURL(url, host) {
    var hostLabels = host.split('.');
    var i = hostLabels.length - 1;
    if (findInURL(url, d.Whitelist.URL, 0)) {
        return 'DIRECT';
    }
    if (findInHost(hostLabels, d.Whitelist.Host, i)) {
        return 'DIRECT';
    }
    if (findInURL(url, d.Proxy.URL, 0)) {
        return 'SOCKS 127.0.0.1:1080; DIRECT';
    }
    if (findInHost(hostLabels, d.Proxy.Host, i)) {
        return 'SOCKS 127.0.0.1:1080; DIRECT';
    }
    return 'DIRECT';
}