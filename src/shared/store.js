/* eslint-disable no-param-reassign */
import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';
import awsService from '../shared/awsService';
import shutterstockService from './shutterstockService';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    files: [],
  },
  mutations: {
    changeFiles(state, payload) {
      state.files = payload;
    },
    changeImages(state, payload) {
      state.shutterStockImages[payload.Key] = payload.images;
    },
    addTagForFile(state,payload){
      state.files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) {
          const newLabels = _.trim(_.get(payload,'value','')).split(',');
          if (newLabels.length > 1) {
            file.labels = _.map(newLabels, (value) => ({ Name: _.trim(value) }));
          } else {
            file.labels.push({ Name: payload.value });
          }
        }
        return file;
      });
    },
    removeTagForFile(state,payload){
      state.files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) {
          file.labels = _.remove(file.labels, (label)=> label.Name !== payload.value);
        }
        return file;
      });
    },
    changeTagsForFile(state,payload) {
      state.files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) {
          const newLabels = _.trim(_.get(payload,'value','')).split(',');
          if (newLabels.length > 1) {
            file.labels = _.map(newLabels, (value) => ({ Name: _.trim(value) }));
          }
        }
        return file;
      });
    },
    markTagsTaken(state, payload) {
      state.files = _.map(state.files, (file) => {

        if (file.Key === payload.Key) {
          file.shutterStockImages.data = _.map(file.shutterStockImages.data, (image) => {
            if (_.isEqual(image.id,payload.id)) {
              image = _.assign(image, { tagsTaken: payload.action });
            }
            return image;
          });
        }
        return file;
      });
    },
    addKeywords(state, payload) {
      const updateKeywords = (file, keywords) => {
        _.forEach(keywords, (keyword) => {
          if (_.isUndefined(_.get(file, 'keywords'))) file.keywords = {};
          if (_.isUndefined(_.get(file, ['keywords', keyword]))) {
            file.keywords[keyword] = 1;
          } else {
            file.keywords[keyword] += payload.action;
            if (file.keywords[keyword] === 0) {
              file.keywords = _.omit(file.keywords,keyword);
            }
          }
        });
        return file;
      };
      const files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) file = updateKeywords(file, payload.keywords);
        return file;
      });
      state.files = files;
    },
  },
  actions: {
    //aws
    async detectLabels({ commit, state }, name) {
      let files = _.map(state.files, file => file.Key === name ? _.assign(file, { loading: true }) : file);
      commit('changeFiles', files);
      const labels = await awsService.detectLabels(name);
      files = _.map(state.files, file => file.Key === name ? _.assign(file, { labels, loading: false }) : file);
      commit('changeFiles', files);
    },
    async listObjects({ commit, dispatch }) {
      const files = await awsService.listObjects();
      commit('changeFiles', files);
      _.forEach(files, file => dispatch('detectLabels', file.Key));
    },
    async uploadFile({ commit, state, dispatch }, file) {
      const uploaded = await awsService.upload(file);
      const files = _.concat(state.files, uploaded);
      commit('changeFiles', files);
      dispatch('detectLabels', uploaded.Key);
    },
    async deleteImage({ commit, state }, key) {
      try {
        await awsService.deleteImage(key);
        const files = _.reduce(state.files, (accumulator, file) => {
          if (file.Key !== key) accumulator.push(file);
          return accumulator;
        }, []);
        commit('changeFiles', files);
      } catch (err) {
        console.error(err);
      }
    },

    //shutterstock
    async findShutterstockImages({ commit, state, dispatch }, params) {
      const nextPage = params.page  ? params.page + 1 : 1;
      const shutterStockImages = await shutterstockService.findShutterstockImages(params.file.labels, nextPage);
      const files = _.map(state.files, (file) => {
        const mergeData = (oldData, newData, reset = false) => {
          if (!reset) newData.data = _.concat(_.get(oldData,'data',[]), newData.data);
          return newData;
        };
        if (params.file.Key === file.Key) {
          file = _.assign(file, {
            shutterStockImages: mergeData(_.get(file, 'shutterStockImages',{}), shutterStockImages, params.reset),
            size: 'md-size-100',
          });
        }
        return file;
      });
      commit('changeFiles', files);
    },
    async  getShutterstockImageInfo({ commit, state }, params) {
      const res = await shutterstockService.getImageInfo(params.id);
      const keywords = _.get(res, 'keywords');
      commit('addKeywords', { keywords, Key: params.Key, action: 1 });
      commit('markTagsTaken', { id: params.id, Key: params.Key, action: true });
    },
    async removeImageTags({ commit, state}, params){
      const res = await shutterstockService.getImageInfo(params.id);
      const keywords = _.get(res, 'keywords');
      commit('addKeywords', { keywords, Key: params.Key, action: -1 });
      commit('markTagsTaken', { id: params.id, Key: params.Key, action: false });
    },
  },
});

export default store;
