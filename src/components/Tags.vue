<template>
  <div class="tags__inner">
    <div class="tag tag__inner" v-for="keyword  in keywords">
      <span class="tag__name">{{keyword.name}} </span>
      <span class="tag__value">{{keyword.value}}</span>
      <div class="tag__actions">
        <md-button class="tag__button tag__button--remove md-icon-button" @click="removeTag(keyword.name,keyword.value,file.Key)">
          <md-icon>delete</md-icon>
        </md-button>
        <md-button class="tag__button tag__button--add md-icon-button" @click="addTag(keyword.name,keyword.value,file.Key)">
          <md-icon>add</md-icon>
        </md-button>
      </div>


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
        const res = _.find(this.$store.state.files, { Key: this.id });
        return res !== void 0 ? res : {};
      },
      keywords(){
        let res;
        if (this.file !== void 0 ){
          res = _.orderBy(_.map(this.file.keywords,(value,name)=>({name,value})),'value','desc');
        }
        return res;
      }
    },
    methods:{
      removeTag(keyword, num, Key) {
        const params = {
          keywords: [keyword],
          action: -num,
          Key,
        };
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

  .tags__inner {
    flex-basis: 50%;
    max-height: 90vh;
    overflow-y: scroll;

    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
  }

  .tag__inner {
    flex-basis: 40%;
    border: 1px solid black;
    border-radius: 4px;
    margin:0.5em;

    display: flex;
    justify-content: left;
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
