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
    },{
      headers:{
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

const getImages = async (tags) => {
  const query = _.map(tags, tag =>_.get(tag,'Name')) + '';
  axios.get('https://api.shutterstock.com/v2/images/search',{
    auth: {
      username: credentials.client_id,
      password: credentials.client_secret,
    },
    params: {
      query:query
    },
  });

};

const shutterstockService = {
  auth,getImages,
};

export default shutterstockService;

