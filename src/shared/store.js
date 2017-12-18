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
    addKeywords(state, payload) {
      const updateKeywords = (file, keywords) => {
        _.forEach(keywords, (keyword) => {
          if (_.isUndefined(_.get(file, 'keywords'))) file.keywords = {};
          if (_.isUndefined(_.get(file, ['keywords', keyword]))) {
            file.keywords[keyword] = 1;
          } else {
            file.keywords[keyword]++;
          }
        });
        return file;
      };
      const files = _.map(state.files, (file) => {
        return file.Key !== payload.Key ? file : updateKeywords(file, payload.keywords);
      });
      state.files = files;
    },
  },
  actions: {
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
    async deleteImage({ commit, state }, key){
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
    async findShutterstockImages({ commit, state, dispatch }, _file) {
      const shutterStockImages = await awsService.findShutterstockImages(_file);
      const files = _.map(state.files, file => _file.Key === file.Key ? _.assign(file, { shutterStockImages, size:'md-size-100' }) : file);
      commit('changeFiles', files);
      _.forEach(shutterStockImages.data, (image) => {
        dispatch('getImageInfo', { id: image.id, Key: _file.Key });
      });
    },
    async  getImageInfo({ commit, state }, params) {
      const res = await shutterstockService.getImageInfo(params.id);
      const keywords = _.get(res, 'keywords');
      commit('addKeywords', { keywords, Key: params.Key });
    },
  },
});

export default store;
