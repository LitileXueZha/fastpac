const USAGE = `
Usage: node fastpac.js <path-to-rules.txt>

Options:
    --node  exports FindProxyForURL function
`.trim();

const PROXY = 'SOCKS 127.0.0.1:1080; DIRECT';
const OUT = 'proxy.pac';

function ProxyAutoConfiguration(rules, proxy) {
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

    const d = {
        Whitelist: { URL: [], Host: {} },
        Proxy: { URL: [], Host: {} },
    };
    const REG_TRIM = /^\.|\/$/g;
    const REG_REG = /(^\/|[*?])/;
    for (let i = 0, len = rules.length; i < len; i++) {
        let line = rules[i];
        if (!line) continue;
        if (line[0] === '!') continue;
        if (REG_REG.test(line)) {
            console.log('正则不支持', line);
            continue;
        }
        line = line.replace('%2F', '/').replace(REG_TRIM, '');
        if (line[0] === '@') {
            if (line[3] === '|') {
                // @@||
                addHost(d.Whitelist.Host, line.substring(4));
                continue;
            }
            // @@|
            d.Whitelist.URL.push(line.substring(3));
            continue;
        }
        if (line[0] === '|') {
            if (line[1] === '|') {
                addHost(d.Proxy.Host, line.substring(2));
                continue;
            }
            d.Proxy.URL.push(line.substring(1));
            continue;
        }
        // Non Adblock filters
        if (line.indexOf('/') > 0) {
            if (!line.startsWith('http')) {
                line = `https://${line}`;
            }
            // Maybe a URL
            d.Proxy.URL.push(line);
            continue;
        }
        addHost(d.Proxy.Host, line);
    }
    // Format Proxy URLs
    d.Proxy.URL = d.Proxy.URL.filter((u) => {
        const { host, pathname } = new URL(u);
        if (pathname === '/') {
            addHost(d.Proxy.Host, host);
            return false;
        }
        return true;
    });
    function addHost(tree, host) {
        const labels = host.split('.');
        for (let i = labels.length - 1; i >= 0; i--) {
            const label = labels[i];
            if (i === 0) {
                tree[label] = null;
            } else {
                if (!tree[label]) tree[label] = {};
                tree = tree[label];
            }
        }
    }

    const res = ['"use strict";'];
    res.push(`\nvar PROXY = '${proxy}';`);
    res.push(`\n${FindProxyForURL.toString()}`);
    res.push(findInURL.toString());
    res.push(findInHost.toString());
    res.push(`\nvar d = ${JSON.stringify(d)};`);
    return res.join('\n');
}

function main() {
    if (process.argv.indexOf('-h') > 0) {
        console.log(USAGE);
        return;
    }
    const fs = require('fs');
    const raw = fs.readFileSync(process.argv[2], 'utf-8');
    // const raw = Buffer.from(fs.readFileSync(process.argv[2], 'utf-8'), 'base64').toString();
    const rules = raw.split('\n');
    const out = fs.createWriteStream(OUT);
    out.write(ProxyAutoConfiguration(rules, PROXY));
    if (process.argv.indexOf('--node') > -1) {
        out.write('\nexports.FindProxyForURL=FindProxyForURL');
    }
}

main();
