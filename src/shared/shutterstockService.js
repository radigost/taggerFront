import axios from 'axios';
import ShutterstockOAuth from '../shared/shutterstock-oauth';

const credentials = require('../credentials.json').Shutterstock;

const shutterstock = axios.create({
  baseUrl: 'https://api.shutterstock.com/v2/',
  auth: {
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
  },
});


const myCallback = (callbackName, data) => {
  console.log(callbackName, data);
  if (callbackName === 'complete') {
    axios.post('https://api.shutterstock.com/v2/oauth/access_token', {
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      code: data.code,
      grant_type: 'authorization_code',
    }, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        // 'Access-Control-Allow-Headers':'Access-Control-Allow-Headers'
        // 'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

const auth = new ShutterstockOAuth({
  client_id: credentials.client_id,
  scope: credentials.scope,
  redirect_endpoint: credentials.redirect_endpoint,
  success(data) { myCallback('success', data); },
  failure(data) { myCallback('failure', data); },
  complete(data) { myCallback('complete', data); },
});

const findShutterstockImages = async (tags, page = 1, category='13') => {
  const query = _.map(tags, tag => _.get(tag,'Name')) + '';
  let res = { data: [] };
  try {
    res = await axios.get('https://api.shutterstock.com/v2/images/search',{
      auth: {
        username: credentials.client_id,
        password: credentials.client_secret,
      },
      params: {
        query,
        page,
        sort:'relevance',
        category,
      },
    });
  } catch (err) {
    console.log(err);
  }
  return res.data;
};

const getImageInfo = async (id) => {
  const res = await axios.get(`https://api.shutterstock.com/v2/images/${id}`,{
    auth: {
      username: credentials.client_id,
      password: credentials.client_secret,
    },
    headers:{
      'Accept-Language':'en-EN'
    }
  });
  return res.data;
}

const shutterstockService = {
  auth, findShutterstockImages, getImageInfo,
};

export default shutterstockService;

