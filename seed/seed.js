const axios = require('axios').default;
const characters = require('./characters')

async function seed() {
  characters.forEach(function(character) {
    try {
      await axios.post('http://localhost:8080/characters', character);
    } catch (err) {
      console.log(err);
    }
  })
}

seed();
