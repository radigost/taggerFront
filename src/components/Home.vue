<template>
  <div class="hello">
    <h1>Теггер v 0.1</h1>
      <card-list/>
    </div>
  </div>
</template>

<script>
  import * as _ from 'lodash'
  import awsService from '../shared/awsService'
  import CardList from './CardList.vue'

  export default {
    components: {
      CardList,
      },
    name: 'HelloWorld',
    created(){
      this.$store.dispatch('listObjects');
    },
    methods:{
      onFileChange(e){
        let files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;
        const file = _.head(document.getElementById('photoupload').files);
        this.$store.dispatch('uploadFile',file)
      },
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
  .pictures table, tr, td{
    border: 1px solid black;

  }
</style>
