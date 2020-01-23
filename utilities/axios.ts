import axios from 'axios';

export default (async function() {
  const url = process.env.API_URL ?? 'localhost:8080';
  const res = await axios.post(`${url}/auth/local`, {
    identifier: process.env.API_EMAIL,
    password: process.env.API_PASSWORD
  });
  const jwt = res.data.jwt;
  return axios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
})();
