import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import sqlite3 from 'sqlite3';
import { types } from "./schema.js";

const database = new sqlite3.Database("./users.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
});

database.run(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name, email)`)

const resolvers = {
    Query: {
        users: () => {
            return new Promise((resolve, reject) => {
                database.all(`SELECT * FROM users`, [], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        }   
    },
    Mutation: {
        addUser: (_, args) => {
            return new Promise((resolve, reject) => {
                const { name, email } = args;

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (email && !emailRegex.test(email)) {
                    reject(new Error('Invalid email format'));
                    return;
                }

                database.run(`INSERT INTO users (name, email) VALUES (?, ?)`, [name, email], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, name, email });
                    }
                });
            });
        },
        updateUser(_, args) {
            return new Promise((resolve, reject) => {
                database.get(`SELECT * FROM users WHERE id = ?`, [args.id], (err, user) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (!user) {
                            reject(new Error(`User with id = ? not found`, args.id));
                            return;
                        }

                        if (args.name != null) {
                            user.name = args.name;   
                        }
                        if (args.email != null) {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                            if (args.email && !emailRegex.test(args.email)) {
                                reject(new Error('Invalid email format'));
                                return;
                            }

                            user.email = args.email;
                        }
                        
                        database.run(`UPDATE users SET name = ?, email = ? WHERE id = ?`, [user.name, user.email, user.id], function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(user);
                            }
                        });
                    }
                });
            });
        },
        deleteUser(_, args) {
            return new Promise((resolve, reject) => {
                database.run(`DELETE FROM users WHERE id = ?`, args.id, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        database.all(`SELECT * FROM users`, [], (err, rows) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(rows);
                            }
                        });
                    }
                });
            });
        }
    }
}

const server = new ApolloServer({
    typeDefs: types, 
    resolvers
})

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000}           
})

console.log('Server started at port 4000');
