const DocumentationOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Self Service Rest API",
        version: "1.0.0",
        description: "NodeJs / Express Rest API to handle user creation & Authorisation",
        termsOfService: "",
        contact: {
          name: "API Support",
          email: "it-support@edelrid.de",
        },
      },
  
      servers: [
        {
          url: "http://localhost:3001",
          description: "Rest API Documentation",
        },
      ],
    },
    apis: ["./routes/*.js"],
  };


  module.exports = {DocumentationOptions};