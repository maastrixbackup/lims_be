const db = require('../config/db');

const Role = {
    async findById(id){
        const [rows] = await db.query("SELECT * FROM roles WHERE id = ? ", [id]);
        return rows[0];
    },

    async findAll(){
        const [rows] = await db.query("SELECT * FROM roles");
        return rows;
    }
};

module.exports = Role;