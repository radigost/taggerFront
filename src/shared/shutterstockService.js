import axios from 'axios';
import ShutterstockOAuth from '../shared/shutterstock-oauth';

const credentials = require('../credentials.json').Shutterstock;


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

export default auth;

