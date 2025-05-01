import { Url } from './optimizer/mongoDBConfig.js';
import { connectRedis, getCache, setCache } from "./optimizer/redisConfig.js";

function isValidUrl(url) {
    return /^https?:\/\//.test(url); // Chỉ kiểm tra các URL bắt đầu với http:// hoặc https://
}

// Kết nối tới Redis
async function redisConnection() {
    try {
        await connectRedis();
        console.log("Connected to Redis.");
    } catch (err) {
        console.error("Failed to connect to Redis:", err.message);
    }
}
redisConnection();

function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

async function findOrigin(id) {
    try {
        let cachedUrl = await getCache(id);
        if (cachedUrl) {
            return cachedUrl;
        }
        // Nếu không có trong Redis, truy vấn MongoDB
        const doc = await Url.findOne({ id });
        if (!doc) return null;
        cachedUrl = doc.url;

        // Lưu vào Redis cache
        await setCache(id, doc.url);
        return cachedUrl;
    } catch (error) {
        throw new Error(`Error finding url:  ${error.message}`);
    }
}

async function create(id, url) {
    try {
        if (!isValidUrl(url)){
            throw new Error("Invalid URL provided.");
        }
        const newEntry = new Url({ id, url });
        await newEntry.save();
        console.log("Created new short URL:", id);

        // Lưu vào Redis cache
        await setCache(id, url);

        return id;
    } catch (error) {
        throw new Error(`Error creating shorted url: ${error.message}`);
    }
}

async function shortUrl(url) {
    const cachedId = await getCache(url);
    if (cachedId) {
        return cachedId;
    }
    const existingEntry = await Url.findOne({ url });
    if (existingEntry) {
        // Lưu vào Redis cache
        await setCache(existingEntry.id, url);
        return existingEntry.id;
    }
    while (true) {
        let newID = makeID(5);
        let originUrl = await findOrigin(newID);
        if (originUrl == null) {
            await create(newID, url)
            return newID;
        }
    }
}

export { findOrigin, shortUrl };