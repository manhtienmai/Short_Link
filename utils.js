import { Url } from './optimizer/mongoDBConfig.js';
import { connectRedis, getCache, setCache } from "./optimizer/redisConfig.js";
import { randomBytes } from 'crypto';

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

// Đã tối ưu:
// - Thay vì dùng Math.random(), sử dụng crypto.randomBytes() để sinh số ngẫu nhiên an toàn về mặt mật mã (CSPRNG)
// - Tránh vòng lặp thủ công: dùng Array.from để chuyển byte thành ký tự tương ứng hiệu quả hơn
// - Giảm xác suất trùng ID và tăng bảo mật (không thể đoán ID kế tiếp)

function makeID(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = randomBytes(length); // sinh mảng byte ngẫu nhiên an toàn
    const charsLength = chars.length;

    return Array.from(bytes, byte => chars[byte % charsLength]).join('');
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
        await Promise.all([
            setCache(id, doc.url),
            setCache(doc.url, id)
        ]);
        return cachedUrl;
    } catch (error) {
        throw new Error(`Error finding url:  ${error.message}`);
    }
}

// Cache aside
// Tối ưu bằng cách sử dụng cache 2 chiều và Promise.all để chạy song song các tác vụ bất đồng bộ.
// 1. **Cache 2 chiều**:
//    - Khi tìm URL theo ID, nếu có kết quả thì lưu ID vào cache với key là URL.
//    - Khi tìm URL theo ID, nếu không có kết quả, sẽ lưu URL với key là ID trong cache.
//    - Điều này giúp đảm bảo việc tìm kiếm 2 chiều trong cả hai hướng (ID -> URL và URL -> ID) giúp tối ưu hiệu suất khi truy xuất lại sau này.
// 2. **Promise.all**:
//    - Thay vì chờ từng lệnh `setCache` tuần tự (lệnh thứ hai chỉ thực thi sau khi lệnh đầu tiên hoàn tất),
//      `Promise.all` cho phép cả hai lệnh `setCache` chạy song song đồng thời, giúp giảm thời gian chờ đợi, từ đó cải thiện hiệu suất tổng thể.
//    - Việc này hữu ích khi cần lưu vào cache cho cả hai chiều (ID <-> URL) cùng lúc mà không làm gián đoạn các tác vụ khác.
async function create(id, url) {
    try {
        if (!isValidUrl(url)){
            throw new Error("Invalid URL provided.");
        }
        const newEntry = new Url({ id, url });
        await newEntry.save();
        console.log("Created new short URL:", id);

        // Lưu vào Redis cache
        await Promise.all([
            setCache(id, url),
            setCache(url, id)
        ]);
        

        return id;
    } catch (error) {
        throw new Error(`Error creating shorted url: ${error.message}`);
    }
}

async function shortUrl(url) {
    // Kiểm tra trong Redis cache
    const cachedId = await getCache(url);
    if (cachedId) {
        return cachedId;
    }

    // Kiểm tra trong MongoDB nếu chưa có trong Redis
    const existingEntry = await Url.findOne({ url });
    if (existingEntry) {
        // Cache 2 chiều
        await Promise.all([
            setCache(existingEntry.id, url),
            setCache(url, existingEntry.id)
        ]);
        return existingEntry.id;
    }

    const maxAttempts = 10; // Tối đa 10 lần thử để tạo ID mới
    // Tránh vòng lặp vô hạn trong trường hợp sinh ID trùng (đặc biệt nếu DB đã lớn).
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const newID = makeID(5);

        // Ưu tiên kiểm tra cache trước để tiết kiệm thời gian
        const cachedOrigin = await getCache(newID);
        if (cachedOrigin) continue;

        // Nếu không có trong Redis, kiểm tra MongoDB
        const existingIdEntry = await Url.findOne({ id: newID });
        if (existingIdEntry) continue;

        // Nếu ID chưa được sử dụng, tiến hành tạo mới
        await create(newID, url);
        return newID;
    }

    throw new Error("Failed to generate a unique short URL after multiple attempts.");
}

export { findOrigin, shortUrl };