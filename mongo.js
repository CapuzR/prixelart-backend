const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

module.exports = async()=> {
    if(process.env.NODE_ENV == 'test') {
        await mongoose.connect(process.env.MONGO_URI, {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: false,
            useFindAndModify: false,
          })
          .then(x => {
          console.log(
              `Connected to Mongo! Database name: "${x.connections[0].name}"`,
          );
      })
      .catch(err => {
          console.error('Error connecting to mongo', err);
      });
    } else {
        await mongoose.connect(process.env.MONGO_URI, {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
          })
          .then(x => {
          console.log(
              `Connected to Mongo! Database name: "${x.connections[0].name}"`,
          );
      })
      .catch(err => {
          console.error('Error connecting to mongo', err);
      });
    }
    }
