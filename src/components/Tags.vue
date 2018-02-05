<template>
  <div class="list__tags-container">
    <div class="list__tag" v-for="(num, keyword ) in file.keywords">
      {{num}} - {{keyword}}
      <md-button @click="removeTag(keyword,num,file.Key)">х</md-button>
      <md-button @click="addTag(keyword,num,file.Key)">+</md-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'tags',
    props:{
      'id':String,
    },
    computed:{
      file() {
        return _.find(this.$store.state.files, { Key: this.id });
      },
    },
    methods:{
      removeTag(keyword, num, Key) {
        const params = {
          keywords: [keyword],
          action: -num,
          Key,
        };
        console.log(params);
        this.$store.commit('addKeywords', params);
      },
      addTag(keyword, num, Key) {
        this.$store.commit('addTagForFile', { value: keyword, Key });
        this.removeTag(keyword, num, Key);
      },
    }
  };
</script>

<style scoped>

  .list__tags-container {
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    flex-basis: 40%;
    max-height: 90vh;
    overflow-y: scroll;
  }

  .list__tag {
    flex-basis: 15%;
    border: 1px solid black;
    border-radius: 4px;
  }
</style>
