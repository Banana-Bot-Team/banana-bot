const dotenv = require('dotenv')
dotenv.config()
const axios = require('axios').default;
const characters = require('./characters')

async function patch() {
 characters.forEach(async function(character, index) {
    // if(character.JPName === "カリオストロ") console.log(character)
    try {
      const res = await axios.get(`${process.env.API_URL}/lookup?name=${encodeURIComponent(character.JPName)}`)
      console.log(character.JPName)
      const data = res.data
      if(data.length > 0) {
        console.log( data[0].id )
        await axios.put(`${process.env.API_URL}/${data[0].id}`, character);
      }
    } catch (err) {
      console.log(err);
    }
  })
}

patch();
