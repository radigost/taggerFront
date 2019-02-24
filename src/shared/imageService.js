import {images} from './http';

const imageService ={
  async listObjects() {
    const files = await images.get('/');
    return files.data;
  },

  async deleteImage(key) {
    const files = await images.delete(`/${key}`);
    return files.data;
  },

  async upload(file) {
    let data = new FormData();
    data.append('file', file, file.name);
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };
    const res = await  images.post('/', data, config) ;
    return this._getImage(res.data);
  },

  async detectLabels(name) {
    try {
      const files = await images.get(`/${name}/rekognize`);
      return files.data;
    } catch (err) {
      console.error(err, err.stack);
      return [];
    }
  },

  async _getImage(image) {
    const data = await  images.get(`/${image.Key}`) ;
    return data.data;
  },
};
export default imageService;
