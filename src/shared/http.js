import axios from 'axios/index';

export const http = axios.create({
  baseURL:'http://localhost:3000/api'
});

export const shutterstock = axios.create({
  baseURL:'http://localhost:3000/api/stocks/shutterstock'
});

export const images = axios.create({
  baseURL:`http://localhost:3000/api/images`
});
