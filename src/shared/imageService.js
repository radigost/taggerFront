import axios from 'axios';

class ImageService {
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
    const files = await axios.get('http://localhost:3000/images');
    return files.data;
  }

  async deleteImage(key) {
    const files = await axios.delete(`http://localhost:3000/images/${key}`);
    return files.data;
  }

  async upload(file) {
    let data = new FormData();
    data.append('file', file, file.name);
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };
    const res = await  axios.post('http://localhost:3000/images', data, config) ;
    return this._getImage(res.data);
  }

  async detectLabels(name) {
    try {
      const files = await axios.get(`http://localhost:3000/images/${name}/rekognize`);
      return files.data;
    } catch (err) {
      console.error(err, err.stack);
      return [];
    }
  }

  async _getImage(image) {
    const data = await  axios.get(`http://localhost:3000/images/${image.Key}`) ;
    return data.data;
  }


}

const imageService = new ImageService();
export default imageService;
