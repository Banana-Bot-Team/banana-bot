const axios = require('axios').default;
const characters = require('./characters')

async function patch() {
 characters.forEach(async function(character, index) {
    // if(character.JPName === "カリオストロ") console.log(character)
    try {
      const res = await axios.get(`http://45.77.131.110:8080/characters/lookup?name=${encodeURIComponent(character.JPName)}`)
      console.log(character.JPName)
      const data = res.data
      if(data.length > 0) {
        console.log( data[0].id )
        await axios.put(`http://45.77.131.110:8080/characters/${data[0].id}`, character);
      }
    } catch (err) {
      console.log(err);
    }
  })
}

patch();
