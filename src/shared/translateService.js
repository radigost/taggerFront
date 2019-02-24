import { translate } from './http';


const translateService = {
  async translate(text) {
    const res = await translate('', { params: { text } });
    return res.data.translation;
  }
};

export default translateService;
