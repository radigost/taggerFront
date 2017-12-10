<template>
  <md-button @click="ShutterAuth">Авторизация</md-button>
</template>
<script>
  import shutterstockService from '../shared/shutterstockService';


  export default{
    methods:{
    ShutterAuth(){
      shutterstockService.auth.authorize();
    },
  }
  }
</script>
<style></style>
