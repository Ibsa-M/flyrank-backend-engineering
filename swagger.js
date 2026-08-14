const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "FlyRank Backend API",
      version: "1.0.0",
      description: "Backend API with CRUD operations and Supabase authentication",
    },

    servers: [
      {
        url: "http://localhost:3000",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./routes/*.js", "./app.js"],
};

module.exports = swaggerJsdoc(options);