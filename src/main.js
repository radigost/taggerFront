// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'vue-material/dist/vue-material.css';

import  VueMaterial from 'vue-material';
import Vue from 'vue';

import App from './App';
import store from './shared/store';
import router from './router';

import VTooltip from 'v-tooltip'

Vue.use(VTooltip);


Vue.config.productionTip = true;
Vue.use(VueMaterial);


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});




