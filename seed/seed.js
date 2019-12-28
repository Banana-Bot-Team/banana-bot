const dotenv = require('dotenv')
dotenv.config()
const axios = require('axios').default;
const characters = require('./characters')

async function seed() {
  characters.forEach(function(character) {
    try {
      await axios.post(`${process.env.API_URL}`, character);
    } catch (err) {
      console.log(err);
    }
  })
}

seed();
