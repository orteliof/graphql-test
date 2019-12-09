const schema = require('./schemas/schema');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');

// Creating ApolloServer instance.
const server = new ApolloServer({ schema });

// Creating express app.
const app = express();

// Allow cross-origin request.
app.use('*', cors());

// Connecting express app with apollo.
server.applyMiddleware({ app });

// Start a web server that listens on port 4000.
app.listen({ port: 4000 }, () => {
    console.log(`🚀  Server ready at http://localhost:4000${server.graphqlPath}`)
});