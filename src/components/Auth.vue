<template>
  <md-button @click="ShutterAuth">Авторизация</md-button>
</template>
<script>


  export default{
    methods:{
    ShutterAuth(){
      shutterstockService.auth.authorize();
    },
  }
  }
</script>
<style></style>
