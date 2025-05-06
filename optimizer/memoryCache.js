import NodeCache from 'node-cache';

const memoryCache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120
});

export function getFromMemory(key) {
    return memoryCache.get(key);
}

export function setInMemory(key, value, ttl=60) {
    memoryCache.set(key, value, ttl);
}

export function deleteFromMemory(key) {
    memoryCache.del(key);
}

export function hasInMemory(key) {
    return memoryCache.has(key);
}
