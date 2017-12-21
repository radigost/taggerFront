<template>
  <div class="list__shutterstock">
    <div v-if="file && file.shutterStockImages" style="overflow-y:auto;" >
      <p>Всего найдено похожих - {{getProperty(file,'shutterStockImages.total_count')}} </p>
      <div>
        {{file.keywords}}
      </div>
      <div class="shutterstock__list">
        <div class="shutterstock__row" v-for="image in file.shutterStockImages.data" :key="image.id">
          <div class="shutterstock__cell shutterstock__cell--image">
            <img :src="getImage(image)"/>
          </div>
          <div class="shutterstock__cell">
            {{image.description}}
          </div>
          <div class="shutterstock__cell">
            <md-button @click="getTags(image,file.Key)" :disabled="image.tagsTaken">Взять теги</md-button>
            <md-button @click="removeTags(image,file.Key)" :disabled="!image.tagsTaken">Убрать теги</md-button>
          </div>
        </div>
      </div>
      <md-button @click="more()">еще</md-button>
    </div>
  </div>

</template>
<script>
  import MdTable from "../../node_modules/vue-material/src/components/mdTable/mdTable.vue";
  import MdTableRow from "../../node_modules/vue-material/src/components/mdTable/mdTableRow.vue";
  import MdTableCell from "../../node_modules/vue-material/src/components/mdTable/mdTableCell.vue";
  import MdButton from "../../node_modules/vue-material/src/components/mdButton/mdButton.vue";

  export default {
    name: 'shutterstockList',
    components:{
      MdTable,
      MdTableRow,
      MdTableCell,
      MdButton,
    },
    props:['id'],
    computed:{
      file(){
        return _.find(this.$store.state.files,{Key:this.id});
      },
      currentPage(){
        return this.file.shutterStockImages.page;
      }
    },
    methods:{
      getProperty(elem,property){
        return _.get(elem,`${property}`);
      },
      getImageKeywords(Key){
        return _.get(this.$store.state.shutterStockImages,'Key');
      },
      getImage(image){
        return _.get(image,'assets.small_thumb.url');
      },
      sortedKeywords(list){
        return Object.keys(list).sort(function(a,b){return list[a]-list[b]})
      },
      getTags(image,Key){
        const params ={
          id: image.id,
          Key: Key
        };
        this.$store.dispatch('getShutterstockImageInfo', params);
      },
      removeTags(image,Key){
        const params ={
          id: image.id,
          Key: Key
        };
        this.$store.dispatch('removeImageInfo', params);
      },
      more(){
        const params = {
          file: this.file,
          page: this.currentPage,
        }
        this.$store.dispatch('findShutterstockImages',params);
      }
    }
  }
</script>

<style>
  .list__shutterstock{
    flex: 1;
    flex-basis: 77%;
    max-height: 60em;
    overflow-y: scroll;
  }
  .shutterstock__list{
    display: flex;
    flex-flow: column;
  }
  .shutterstock__row{
    display:flex;
   flex-flow: row;
  }
  .shutterstock__cell{
    flex-basis: 33%;
  }
</style>
