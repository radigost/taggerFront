/* eslint-disable no-param-reassign */
import _ from 'lodash';
import Vue from 'vue';
import Vuex from 'vuex';
import imageService from './imageService';
import translateService from './translateService'
import { shutterstock } from './http';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    files: [],
    loadingImageList: false,
    categories: [],
    selectedCategory: 13
  },
  mutations: {
    changeFiles(state, payload) {
      state.files = payload;
    },
    changeImages(state, payload) {
      state.shutterStockImages[payload.Key] = payload.images;
    },

    addTagForFile(state, payload) {
      state.files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) {
          const newLabels = _.trim(_.get(payload, 'value', ''))
            .split(',');
          if (newLabels.length > 1) {
            file.labels = _.map(newLabels, value => ({ Name: _.trim(value) }));
          } else {
            file.labels.push({ Name: payload.value });
          }
        }
        return file;
      });
    },
    removeTagForFile(state, payload) {
      state.files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) {
          file.labels = _.remove(file.labels, label => label.Name !== payload.value);
        }
        return file;
      });
    },
    changeTagsForFile(state, payload) {
      state.files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) {
          const newLabels = _.trim(_.get(payload, 'value', ''))
            .split(',');
          if (newLabels.length > 1) {
            file.labels = _.map(newLabels, value => ({ Name: _.trim(value) }));
          }
        }
        return file;
      });
    },
    markTagsTaken(state, payload) {
      state.files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) {
          file.shutterStockImages.data = _.map(file.shutterStockImages.data, (image) => {
            if (_.isEqual(image.id, payload.id)) {
              image = _.assign(image, { tagsTaken: payload.action });
            }
            return image;
          });
        }
        return file;
      });
    },
    updateTagForFile(state,payload){
      state.files= state.files.map((file)=>{
        if(_.isEqual(file.Key,payload.Key)){
          file.labels = file.labels.map((tag)=>{
            if(tag.Name === payload.tag.Name){
              tag = payload.tag;
            }
            return tag;
          })
        }
        return file;
      })
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
              file.keywords = _.omit(file.keywords, keyword);
            }
          }
        });
        return file;
      };
      const files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) {
          file = updateKeywords(file, payload.keywords);
        }
        return file;
      });
      state.files = files;
    },
    resetKeywords(state,payload){
      const files = _.map(state.files, (file) => {
        if (file.Key === payload.Key) {
          file.keywords = {};
        }
        return file;
      });
      state.files = files;
    },

    changeLoadingImageState(state, isLoading) {
      state.loadingImageList = isLoading;
    },

    changeCategories(state, categories) {
      state.categories = categories;
    },
    changeSelectedCategory(state, category) {
      state.selectedCategory = category;
    }
  },
  actions: {
    // aws
    async detectLabels({ commit, state }, name) {
      let files = _.map(state.files, file => file.Key === name ? _.assign(file, { loading: true }) : file);
      commit('changeFiles', files);
      const labels = await imageService.detectLabels(name);
      files = _.map(state.files, file => file.Key === name ? _.assign(file, {
        labels,
        loading: false
      }) : file);
      commit('changeFiles', files);
    },
    async listObjects({ commit, dispatch }) {
      commit('changeLoadingImageState', true);
      const files = await imageService.listObjects();
      commit('changeFiles', files);
      commit('changeLoadingImageState', false);
      _.forEach(files, file => dispatch('detectLabels', file.Key));
    },
    async uploadFile({ commit, state, dispatch }, file) {
      commit('changeLoadingImageState', true);
      const uploaded = await imageService.upload(file);
      const files = _.concat(state.files, uploaded);
      commit('changeLoadingImageState', false);
      commit('changeFiles', files);
      dispatch('detectLabels', uploaded.Key);
    },
    async deleteImage({ commit, state }, key) {
      try {
        await imageService.deleteImage(key);
        const files = _.reduce(state.files, (accumulator, file) => {
          if (file.Key !== key) accumulator.push(file);
          return accumulator;
        }, []);
        commit('changeFiles', files);
      } catch (err) {
        console.error(err);
      }
    },

    // shutterstock
    async findShutterstockImages({ commit, state, dispatch }, params) {
      const page = params.page ? params.page + 1 : 1;
      const query = _.map(params.file.labels, tag => _.get(tag, 'Name')) + '';
      const category = _.get(state, 'selectedCategory.id', 13);

      const recievedShutterStockImages = await shutterstock.get('', {
        params: {
          query,
          page,
          category
        }
      });
      const files = _.map(state.files, (file) => {
        const appendOrSetShutterStockImages = (file, shutterStockImages, reset = false) => {

          const updateDataAndPageForImages = (oldShutterStockImages, shutterStockImages, reset = false) => {

            const setPage = (oldPage, reset = false) => (!reset && oldPage) ? ++oldPage : 1;
            const mergeData = (oldData, newData, reset = false) => (!reset) ? _.concat(oldData, newData) : newData;
            const oldData = _.get(oldShutterStockImages, 'data', []);
            const newData = _.get(shutterStockImages, 'data', []);

            const result = {
              data: mergeData(oldData, newData, reset),
              page: setPage(oldShutterStockImages.page, reset),
            };
            return result;
          };

          if (params.file.Key === file.Key) {
            const oldShutterStockImages = _.get(file, 'shutterStockImages', {});
            file.shutterStockImages = updateDataAndPageForImages(oldShutterStockImages, shutterStockImages, reset);
            file.size = 'md-size-100';
          }

          return file;
        };

        const reset = params.reset;
        const resFile = appendOrSetShutterStockImages(file, recievedShutterStockImages, reset);

        return resFile;
      });
      commit('changeFiles', files);
    },
    async getShutterstockImageInfo({ commit, state }, params) {
      const res = await shutterstock.get(`/${params.id}`);
      const keywords = _.get(res, 'data.keywords');
      commit('addKeywords', { keywords, Key: params.Key, action: 1 });
      commit('markTagsTaken', { id: params.id, Key: params.Key, action: true });
    },
    async removeImageTags({ commit, state }, params) {
      const res = await shutterstock.get(`/${params.id}`);
      const keywords = _.get(res, 'data.keywords');
      commit('addKeywords', { keywords, Key: params.Key, action: -1 });
      commit('markTagsTaken', { id: params.id, Key: params.Key, action: false });
    },

    async getShutterstockCategories({ commit, state }) {
      const res = await shutterstock.get(`/categories`);
      commit('changeCategories', _.get(res, 'data'));
    },

  //  translate
    async translateTag({commit,state},params){
      const text = await translateService.translate(params.tag.Name);
      const updatedTag = {...params.tag,translatedName:text};
      commit('updateTagForFile',{tag:updatedTag,Key:params.Key});
    },
  },
});

export default store;
