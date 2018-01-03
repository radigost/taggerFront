<template>
  <div id="app">
    <router-link to="/">Home</router-link>
    <router-view/>
  </div>
</template>

<script>
  export default {
  name: 'app',
};
</script>

<style>
  @import  url('http://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic');
  @import  url('http://fonts.googleapis.com/icon?family=Material+Icons') ;
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
