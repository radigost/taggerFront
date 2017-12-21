import * as _ from 'lodash';
import Vue from 'vue';
import shutterstockService from '../shared/shutterstockService';
// import { Vue } from 'vue';

const AWS = require('aws-sdk');


const credentials = require('../credentials.json').AWS;


AWS.config.credentials = new AWS.Credentials(credentials);
AWS.config.region = credentials.region;

const s3 = new AWS.S3({
  params: { Bucket: credentials.Bucket },
});
const rekognition = new AWS.Rekognition();


class AwsService {
  constructor() {
    Object.assign(this, {
      init: false,
      pending: false,
      _files: [],
    });
  }
  get files() {
    return this._files;
  }
  async listObjects() {
    const params = {
      Bucket: credentials.Bucket,
    };
    const data = await s3.listObjects(params).promise();
    const  files = data.Contents;
    const promises = _.map(files, file => this.getImage(file));
    return await Promise.all(promises);
  }
  async detectLabels(name) {
    const doDetect = name => new Promise((resolve, reject) => {
      const params = {
        Image: {
          S3Object: {
            Bucket: credentials.Bucket,
            Name: name,
          },
        },
        MaxLabels: 123,
        MinConfidence: 70,
      };
      rekognition.detectLabels(params, (err, data) => {
        if (err) reject(err, err.stack); // an error occurred
        else {
          resolve(data.Labels);
        }
      });
    });

    try {
      return await doDetect(name);
    } catch (err) {
      console.error(err, err.stack);
      return [];
    }
  }
  async getImage(image) {
    const retrieveImage = async (key) => {
      const params = {
        Key: key,
        Bucket: credentials.Bucket,
      };

      const data = await s3.getObject(params).promise();
      return data.Body;
    };
    const Uint8ToString = (u8a) => {
      const CHUNK_SZ = 0x8000;
      const c = [];
      for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
      }
      return c.join('');
    };
    const retrievedImage = await retrieveImage(image.Key);
    const b64encoded = btoa(Uint8ToString(retrievedImage));
    image.src = `data:image/jpeg;base64,${b64encoded}`;
    return image;
  }
  async upload(file) {
    const params = {
      Key: file.name,
      Body: file,
      ACL: 'public-read-write',
    };
    const data = await s3.upload(params).promise();
    return this.getImage(data);
  }
  deleteImage(key) {
    const params = {
      Bucket: credentials.Bucket,
      Key: key,
    };
    return s3.deleteObject(params).promise();
  }
  // async findShutterstockImages(_file, nextPage = 1) {
  //   return shutterstockService.getImages(_file.labels, nextPage);
  // }

}

const awsService = new AwsService();
export default awsService;
