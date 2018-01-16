<template>
  <div id="app">
    <div class="app__menu" >
      <router-link tag="md-button"  to="/">
        <md-icon class="app__icon">home</md-icon>
      </router-link>
    </div>

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
    font-family: 'Roboto', 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 2em;
  }

  .app__menu{
    display: flex;
    background-color: #2c3e50;

  }
  .app__icon{
    color: #bdbdbd;
  }
</style>
