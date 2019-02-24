import axios from 'axios/index';

const base = SERVER_ADDRESS || 'http://localhost:3000';
export const http = axios.create({
  baseURL:`${base}/api`
});

export const shutterstock = axios.create({
  baseURL:`${base}/api/stocks/shutterstock`
});

export const images = axios.create({
  baseURL:`${base}/api/images`
});

export const translate = axios.create({
  baseURL:`${base}/api/translate`
})
