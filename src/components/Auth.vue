<template>
  <md-button @click="ShutterAuth">Авторизация</md-button>
</template>
<script>
  import auth from '../shared/shutterstockService';


  export default{
    methods:{
    ShutterAuth(){
      auth.authorize();
    },
  }
  }
</script>
<style></style>
