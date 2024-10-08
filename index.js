import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import sqlite3 from 'sqlite3';

const database = new sqlite3.Database("./users.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
});

const server = new ApolloServer({
    
})

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000}
})

console.log('Server started at port 4000');
