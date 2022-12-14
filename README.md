# fastpac

Fast **Proxy Auto-Configuration (PAC)** implementation.

## Benchmark

```txt
FindProxyForURL('https://twitter.com/home','twitter.com');  1e+5 times 
***list.pac: 19.994s
fastpac: 1.359s
```

## Usage and Example

```shell
$ node fastpac.js rules.txt
```

See the exmaple in [example-rules.txt](example-rules.txt).

## Design Principles

+ **Time complexity**: `O(logn)`
+ **Space complexity**: `O(n)`

### Supported Rules

Only support 2 types: **URL** and **Host**. Wildcard like `*` or regular expression are **not** supported.

See also [Adblock Plus filters](https://adblockplus.org/filters).

### 5 priority levels

**Priority 0**. All connections are `DIRECT`.

**Priority 1**. The connections which it's domain or subdomain matched `Host` are `PROXY`.

**Priority 2**. The connections which it's url starts with `URL` are `PROXY`.

**Priority 3** (whitelist). The connections which it's domain or subdomain matched `Host` are `DIRECT`.

**Priority 4** (whitelist). The connections which it's url starts with `URL` are `DIRECT`.

### Implenmentation

```javascript
var d = {
    Whitelist: {
        URL: [],
        Host: {},
    },
    Proxy: {},
};
function FindProxyForURL(url, host) {
    if (d.Whitelist.URL) 'DIRECT'; // Priority 4
    if (d.Whitelist.Host) 'DIRECT'; // Priority 3
    if (d.Proxy.URL) 'PROXY'; // Priority 2
    if (d.Proxy.Host) 'PROXY'; // Priority 1
    'DIRECT'; // Priority 0
}
```

Use `String.prototype.startsWith` when finding in `URL`, and we could add a flag to optimize it (only `url.length < URL[i].length`). Use Trie tree when finding in `Host`, and the labels of host as key.
