import { Url } from "./optimizer/mongoDBConfig";


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
        const url = await Url.findOne({ id });
        return url ? url.url : null;
    } catch (error) {
        throw new Error(`Error finding url:  ${error.message}`);
    }
}

async function create(id, url) {
    try {
        const newEntry = new URLModel({ id, url });

        await newEntry.save();
        console.log("Created new short URL:", id);
        return id;
    } catch (error) {
        throw new Error(`Error creating shorted url: ${error.message}`);
    }
}

// function findOrigin(id) {
//     return new Promise((resolve, reject) => {
//         return db.get(`SELECT * FROM data WHERE id = ?`, [id], function (err, res) {
//             if (err) {
//                 return reject(err.message);
//             }
//             if (res != undefined) {
//                 return resolve(res.url);
//             } else {
//                 return resolve(null);
//             }
//         });
//     });
// }

// function create(id, url) {
//     return new Promise((resolve, reject) => {
//         return db.run(`INSERT INTO data VALUES (?, ?)`, [id, url], function (err) {
//             if (err) {
//                 return reject(err.message);
//             }
//             return resolve(id);
//         });
//     });
// }

async function shortUrl(url) {
    while (true) {
        let newID = makeID(5);
        let originUrl = await findOrigin(newID);
        if (originUrl == null) {
            await create(newID, url)
            return newID;
        }
    }
}

module.exports = {
    findOrigin,
    shortUrl
}