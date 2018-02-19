<template>
  <div class="shutterstock__inner">
    <div class="shutterstock__categories">
      <div class="shutterstock__category" v-for="category in categories" >
        <input type="radio" name="category" v-bind:value="picked"  v-on:change="chooseCategory(category)">
        <label for="category"> {{category.name}}</label>
      </div>
    </div>
    <p>Всего найдено похожих - {{totalShutterStockImages}} </p>
    <div class="shutterstock__list" v-if="file && file.shutterStockImages" >

        <div class="shutterstock__row" v-for="image in file.shutterStockImages.data" :key="image.id">
          <div class="shutterstock__cell shutterstock__image">
            <img :src="getImage(image)"/>
          </div>
          <div class="shutterstock__cell">
            <md-button class="md-icon-button md-dense" @click="getTags(image,file.Key)" :disabled="image.tagsTaken">
              <md-icon>add</md-icon>
            </md-button>
            <md-button class="md-icon-button md-dense" @click="removeTags(image,file.Key)" :disabled="!image.tagsTaken">
            <md-icon>delete</md-icon>
            </md-button>
          </div>
        </div>

      <md-button @click="more()">еще</md-button>
    </div>
  </div>

</template>
<script>
  import MdTable from '../../node_modules/vue-material/src/components/mdTable/mdTable.vue';
  import MdTableRow from '../../node_modules/vue-material/src/components/mdTable/mdTableRow.vue';
  import MdTableCell from '../../node_modules/vue-material/src/components/mdTable/mdTableCell.vue';
  import MdButton from '../../node_modules/vue-material/src/components/mdButton/mdButton.vue';


  export default {
    name: 'shutterstockList',
    components: {
      MdTable,
      MdTableRow,
      MdTableCell,
      MdButton,
    },
    data(){
      return {
      }
    },
    props: ['id'],
    computed: {
      file() {
        return _.find(this.$store.state.files, { Key: this.id });
      },
      currentPage() {
        return this.file.shutterStockImages.page;
      },
      categories() {
        return this.$store.state.categories;
      },
      picked(){
        return this.$store.state.selectedCategory;
      },
      totalShutterStockImages(){
        return (_.get(this.file,'shutterStockImages.data',[])).length
      }

    },
    methods: {
      chooseCategory(category){
        this.$store.commit('changeSelectedCategory',category);
        const params = {
          file: this.file,
          reset:true
        };
        this.$store.dispatch('findShutterstockImages', params);

        // this.picked = category.id
      },
      getProperty(elem, property) {
        return _.get(elem, `${property}`);
      },
      getImageKeywords(Key) {
        return _.get(this.$store.state.shutterStockImages, 'Key');
      },
      getImage(image) {
        return _.get(image, 'assets.large_thumb.url');
      },
      sortedKeywords(list) {
        return Object.keys(list)
          .sort(function (a, b) {
            return list[a] - list[b];
          });
      },
      getTags(image, Key) {
        const params = {
          id: image.id,
          Key: Key
        };
        this.$store.dispatch('getShutterstockImageInfo', params);
      },
      removeTags(image, Key) {
        const params = {
          id: image.id,
          Key: Key
        };
        this.$store.dispatch('removeImageTags', params);
      },

      more() {
        const params = {
          file: this.file,
          page: this.currentPage,
        };
        this.$store.dispatch('findShutterstockImages', params);
      }
    }
  };
</script>

<style>
  .shutterstock__inner {
    flex-basis: 66%;
    max-height: 90vh;
    overflow-y: scroll;
  }

  .shutterstock__list {
    display: flex;
    /*flex-flow: column;*/
    padding: 0.5em;
    flex-wrap: wrap;

  }

  .shutterstock__row {
    display: flex;
    flex-flow: row;
    border: 1px dotted grey;
    border-radius: 4px;
    padding: 0.5em;
    flex-basis: 33%;
  }

  .shutterstock__cell {
    /*flex-basis: 33%;*/
  }
  .shutterstock__image img{
    width: 20em;
  }

  .shutterstock__categories{
    margin: 1em;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .shutterstock__category{
    display: flex;
    flex-direction: row;
    /*margin: 1em;*/
    flex-basis: 30%;
  }
</style>
