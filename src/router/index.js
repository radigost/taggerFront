import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Auth from '@/components/Auth';
import Detail from '@/components/Detail';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path:'/details/:key',
      name:'Detail',
      component:Detail
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth,
    }
  ],
});
