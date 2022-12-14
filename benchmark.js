const URI = 'https://twitter.com/home'; // http://example.org/abc
const HOST = 'twitter.com'; // http2.golang.org
const N = 1e+5;

function run(name, pac, n = 0) {
    console.time(name);
    for (let i = 0; i < n; i++) {
        if (pac.FindProxyForURL(URI, HOST) === 'DIRECT') {
            throw new Error(`Test failed! ${name}`);
        }
    }
    console.timeEnd(name);
}

run('gfwlist.pac', require('./gfwlist.pac'), N);
run('fastpac', require('./proxy.pac'), N);
