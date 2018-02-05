<template>
  <div class="details__inner">
    <h2>Detailed view</h2>
    <div class="details__container">
      <image-card :id="file.Key"/>
      <shutterstock-list :id="file.Key"/>
      <tags :id="file.Key"/>
    </div>
  </div>
</template>

<script>
  import ShutterstockList from './Shutterstock.vue';
  import imageCard from './imageCard.vue';
  import Tags from './Tags.vue';

  export default {
    components: {
      ShutterstockList,
      imageCard,
      Tags
    },
    name: 'detail',
    computed: {
      file() {
        return _.find(this.$store.state.files, { Key: this.$route.params.key });
      }
    },
    created() {
      console.log(this.$route.params.key);
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
