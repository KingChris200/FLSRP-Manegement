const fs = require('fs');
const path = require('path');

const databasePath = path.join(
    __dirname,
    '..',
    'database',
    'staff.json'
);


function loadDatabase() {

    if (!fs.existsSync(databasePath)) {

        fs.writeFileSync(
            databasePath,
            '{}'
        );

    }


    const data =
        fs.readFileSync(
            databasePath,
            'utf8'
        );


    return JSON.parse(data);

}



function saveDatabase(database) {

    fs.writeFileSync(
        databasePath,
        JSON.stringify(
            database,
            null,
            4
        )
    );

}



function createStaffProfile(userId) {

    const database =
        loadDatabase();


    if (!database[userId]) {

        database[userId] = {

            rank: 'Not Assigned',

            awards: 0,

            promotions: 0,

            infractions: 0,

            strikes: 0,

            trainings: 0,

        };


        saveDatabase(database);

    }


    return database[userId];

}



function getStaffProfile(userId) {

    const database =
        loadDatabase();


    return database[userId] || null;

}



function updateStaffProfile(userId, data) {

    const database =
        loadDatabase();


    if (!database[userId]) {

        createStaffProfile(userId);

    }


    database[userId] = {

        ...database[userId],

        ...data,

    };


    saveDatabase(database);


    return database[userId];

}



function addStaffCount(userId, category) {

    const database =
        loadDatabase();


    if (!database[userId]) {

        createStaffProfile(userId);

    }


    database[userId][category]++;


    saveDatabase(database);


    return database[userId];

}



module.exports = {

    loadDatabase,

    saveDatabase,

    createStaffProfile,

    getStaffProfile,

    updateStaffProfile,

    addStaffCount,

};