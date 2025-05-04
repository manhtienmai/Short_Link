import sqlite3 from 'sqlite3';
import { Sequelize, DataTypes } from 'sequelize';
const db = new sqlite3.Database('./db/app.db');

const sequelize = new Sequelize('sqlite::memory');
const Data = sequelize.define('Data', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    url: DataTypes.STRING,
});

async function initializeDatabase() {
    try {
        await sequelize.sync();
        console.log("Database & tables created!");
    } catch (err) {
        console.error("Error creating database:", err);
    }
}

initializeDatabase();

db.run(`
        CREATE TABLE IF NOT EXISTS data(
        id TEXT,
        url TEXT
        ) STRICT
`);

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

function findOriginORM(idx) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await Data.findOne({
                where: { id: idx },
                attributes: ['url']
            });
            if (data) {
                resolve(data.url);
            } else {
                resolve(null);
            }
        } catch (err) {
            reject(err.message);
        } 
    });
}

function findOrigin(id) {
    return new Promise((resolve, reject) => {
        return db.get(`SELECT * FROM data WHERE id = ?`, [id], function (err, res) {
            if (err) {
                return reject(err.message);
            }
            if (res != undefined) {
                return resolve(res.url);
            } else {
                return resolve(null);
            }
        });
    });
}

function createORM(idx, urlx) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await Data.create(
                { id: idx,
                  url: urlx
                }
            );
            data.save();
            console.log(idx);
            resolve(idx);
        } catch (err) {
            reject(err.message);
        } 
    });
}

function create(id, url) {
    return new Promise((resolve, reject) => {
        return db.run(`INSERT INTO data VALUES (?, ?)`, [id, url], function (err) {
            if (err) {
                return reject(err.message);
            }
            return resolve(id);
        });
    });
}   

async function shortUrl(url) {
    while (true) {
        let newID = makeID(5);
        let originUrl = await findOriginORM(newID);
        // console.log("OriginUrl", originUrl);
        if (originUrl == null);
        await createORM(newID, url);
        return newID;
    }
}

export {
    findOriginORM,
    shortUrl
}