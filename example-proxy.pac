"use strict";

var PROXY = 'SOCKS 127.0.0.1:1080; DIRECT';

function FindProxyForURL(url, host) {
        var labels = host.split('.'),
            i = labels.length - 1;
        if (findInURL(url, d.Whitelist.URL, 0)) return 'DIRECT';
        if (findInHost(labels, d.Whitelist.Host, i)) return 'DIRECT';
        if (findInURL(url, d.Proxy.URL, 0)) return PROXY;
        if (findInHost(labels, d.Proxy.Host, i)) return PROXY;
        return 'DIRECT';
    }
function findInURL(url, URLs, i) {
        if (i === URLs.length) {
            return false;
        }
        var max = URLs[i].length;
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
            if (tree === null) return true;
        }
        return false;
    }

var d = {"Whitelist":{"URL":["http://example.org/path-1"],"Host":{"org":{"example":{"list":{"white":null}}}}},"Proxy":{"URL":["https://example.org/path-2","https://example.org/path-2"],"Host":{"org":{"example":null}}}};