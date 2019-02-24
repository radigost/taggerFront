<template>
  <div class="tags__inner">
    <div class="tag tag__inner" v-for="keyword  in keywords" v-show="keyword.value>0">
      <span class="tag__value">{{keyword.value}}</span>
      <span class="tag__name">{{keyword.name}} </span>
      <span class="tag__name">{{keyword.translatedName}} </span>
      <md-button @click="translate(keyword,file.Key)">перевести</md-button>
      <div class="tag__actions">
        <md-button class="tag__button tag__button--remove md-icon-button" @click="removeTag(keyword,file.Key)">
          <md-icon>delete</md-icon>
        </md-button>
        <md-button class="tag__button tag__button--add md-icon-button" @click="addTag(keyword,file.Key)">
          <md-icon>add</md-icon>
        </md-button>
      </div>


    </div>
  </div>
</template>

<script>
  import translateService from '../shared/translateService'
  export default {
    name: 'tags',
    props:{
      'id':String,
    },
    computed:{
      file() {
        const res = _.find(this.$store.state.files, { Key: this.id });
        return res !== void 0 ? res : {};
      },
      keywords(){
        let res;
        if (this.file !== void 0 ){
          res = _.orderBy(this.file.keywords,'value','desc');
        }
        return res;
      }
    },
    methods:{
      removeTag(keyword, Key) {
        const params = {
          keywords: [keyword.name],
          action: -keyword.value,
          Key,
        };
        this.$store.commit('addKeywords', params);
      },
      addTag(keyword,Key) {
        this.$store.commit('addTagForFile', { value: keyword.name, translatedName:keyword.translatedName, Key });
        this.removeTag(keyword,Key);
      },
      async translate(keyword,Key){

        this.$store.dispatch('translateKeyword',{Key,keyword});
      }
    }
  };
</script>

<style scoped>

  .tags__inner {
    flex-basis: 50%;
    max-height: 90vh;
    overflow-y: scroll;

    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
  }

  .tag__inner {
    flex-basis: 100%;
    border: 1px solid black;
    border-radius: 4px;
    margin:0.5em;

    display: flex;
    justify-content: space-between;
  }

  .tag__name{
    margin-left: 1em;
    align-self: center;
    flex-basis: 20em;
    padding-right: 1em;

  }
  .tag__value{
    margin-left: 1em;
    align-self: center;
    padding-right: 1em;
  }
  .tag__actions{
    align-self: right;
    /*flex-basis: 20em;*/
    display: flex;
    justify-content: left;
  }
</style>
