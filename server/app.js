const mongoose = require('mongoose');
const schema = require('./schemas/schema');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');

// Connect to database
const mongoUri = 'mongodb://localhost:27017/graphql-test';
mongoose.connect(
    mongoUri, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then((db) => console.log(`Connected to database at [${mongoUri}]`))
    .catch((err) => console.error(`Error: ${err}`));

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