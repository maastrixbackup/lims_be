const db = require('../config/db');

const User = {
    async findByEmail(email) {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0];
    },
};

module.exports = User;


// const pool = require('../config/db');

// const User = {
//   async findByEmail(email) {
//     const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
//     return rows[0];
//   },

//   async findById(id) {
//     const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
//     return rows[0];
//   },

//   async create(name, email, password_hash, role_id) {
//     const [result] = await pool.query(
//       "INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
//       [name, email, password_hash, role_id]
//     );
//     return { id: result.insertId, name, email, role_id };
//   }
// };

// module.exports = User;