<template>
  <div class="details__inner">
    <h2>Detailed view</h2>

    <div class="details__container" v-show="!loading">
      <image-card :id="file.Key"/>
      <shutterstock-list :id="file.Key"/>
      <tags :id="file.Key"/>
    </div>

    <div v-show="loading">
      <md-progress md-indeterminate></md-progress>
    </div>

  </div>
</template>

<script>
  import ShutterstockList from './Shutterstock.vue';
  import imageCard from './imageCard.vue';
  import Tags from './Tags.vue';

  import MdProgress from "../../node_modules/vue-material/src/components/mdProgress/mdProgress.vue";


  export default {
    components: {
      ShutterstockList,
      imageCard,
      Tags,
      MdProgress,

    },
    name: 'detail',
    computed: {
      file() {
        const res = _.find(this.$store.state.files, { Key: this.$route.params.key });
        return res !== void 0 ? res : {Key:''}
      },
      loading(){
        return this.$store.state.loadingImageList;
      },
    },
    created() {
      if(!_.find(this.$store.state.files, { Key: this.$route.params.key })){
        this.$store.dispatch('listObjects');
      }

      this.$store.dispatch('getShutterstockCategories');

    }
  };

</script>

<style scoped>
  .details__container {
    display: flex;
    flex-flow: row;
    justify-content: left;
  }
</style>
