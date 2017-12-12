// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'vue-material/dist/vue-material.css';
// import 'vue-material/dist/theme/default.css'; // This line here

// import {MdButton,MdCard,MdCardActions,
//   MdCardArea,MdProgressSpinner,MdChip,MdField,MdTextarea,MdIcon,
//   MdCardContent,MdCardMedia,MdCardMediaCover, MdCardHeader ,MdPropValidation} from 'vue-material/dist/components';
var VueMaterial = require('vue-material')
import Vue from 'vue';
import App from './App';
import router from './router';


Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});

Vue.use(VueMaterial)

// Vue.use(MdButton);
// Vue.use(MdCard);
// Vue.use(MdCardActions);
// Vue.use(MdCardArea);
// Vue.use(MdChip);
// Vue.use(MdField);
// Vue.use(MdTextarea);
// Vue.use(MdIcon);
// Vue.use(MdProgressSpinner);
// Vue.use(MdCardContent);
// Vue.use(MdCardMedia);
// Vue.use(MdCardMediaCover);
// Vue.use(MdCardHeader);
// Vue.use(MdPropValidation);
