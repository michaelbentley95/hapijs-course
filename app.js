const hapi = require("hapi");
const Joi = require("joi");
const joi = require("joi");
const mongoose = require("mongoose");

const server = new hapi.Server({ host: "localhost", port: 3000 });

mongoose
  .connect(
    "mongodb+srv://testuser:" +
      process.env.MONGO_ATLAS_PW +
      "@cluster0.opxck.mongodb.net/node-angular?retryWrites=true&w=majority"
  )
  .then((res) => {
    console.log("Connected to Mongo");
  })
  .catch((err) => {
    console.log("Connection to Mongo Failed");
  });

const personModel = mongoose.model("person", {
  firstName: String,
  lastName: String,
});

server.route({
  method: "POST",
  path: "/person",
  options: {
    validate: {
      payload: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
      },
      failAction: (request, h, error) => {
        return error.isJoi
          ? h.response(error.details[0]).takeover()
          : h.response(error).takeover();
      },
    },
  },
  handler: async (request, h) => {
    try {
      var person = new personModel(request.payload);
      var result = await person.save();
      return h.response(result);
    } catch (error) {
      return h.response(error).code(500);
    }
  },
});

server.start();
