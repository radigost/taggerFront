<template>
  <div>
    <div class="list list__inner"></div>
      <div class="list__row" v-for="file in files" :key="file.Key">
        <image-card :id="file.Key"/>
        <shutterstock-list :id="file.Key"/>
      </div>
  </div>
</template>
<script>
import ShutterstockList from './Shutterstock.vue'
import imageCard from './imageCard.vue'


export default {
  components: {
    ShutterstockList,
    imageCard
  },
  name:'cardList',
  computed:{
    files(){
      return this.$store.state.files;
    }
  },
  methods:{

  }
}
</script>
<style>
 .list__inner{
   display: flex;
   flex-flow: column;
 }
  .list__row{
    display: flex;
    flex-flow: row;
  }

</style>

