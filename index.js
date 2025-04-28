const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../db/app.db')
});

const Url = sequelize.define('Url', {
    id : {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'data',
    timestamps: false
});

const initDb = async () => {
    try {
        await sequelize.sync();
        console.log('sync successfully');
    } catch (error) {
        console.error('failed tto sync db: ', error);
    }
};

module.exports = {
    sequelize,
    Url,
    initDb
};