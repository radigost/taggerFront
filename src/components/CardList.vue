<template>
  <div>
    <div class="list list__inner"></div>
        <div class="list__row" v-for="file in files" :key="file.Key">
          <div class="list__card">
              <md-card md-with-hover>
                <md-card-area md-inset>
                  <md-card-media >
                    <img style="width:60em;" :id="file.Key" :src="file.src">
                  </md-card-media>
                  <md-card-actions>
                    <md-button @click="detectLabels(file.Key)" style="width:auto;">Распознать</md-button>
                    <md-button @click="deleteImage(file.Key)" style="width:auto;"> Удалить</md-button>
                    <md-button @click="findShutterstockImages(file)" style="width:auto;"> Найти похожие</md-button>
                  </md-card-actions>
                </md-card-area>
                <md-card-area>
                  <md-card-content>
                    <md-progress-spinner v-show="isLoading(file)" class="md-accent" md-mode="indeterminate"></md-progress-spinner>
                    <md-field>
                      <md-input-container>
                        <md-textarea rows="7" :value="getTags(file.labels)"></md-textarea>
                      </md-input-container>
                    </md-field>
                  </md-card-content>
                </md-card-area>
              </md-card>
          </div>
          <div class="list__shutterstock">
            <shutterstock-list :id="file.Key"/>
          </div>
    </div>
  </div>
</template>
<script>
import ShutterstockList from './Shutterstock.vue'
import MdCardHeader from "../../node_modules/vue-material/src/components/mdCard/mdCardHeader.vue";
import MdButton from "../../node_modules/vue-material/src/components/mdButton/mdButton.vue";


export default {
  components: {
    MdButton,
    MdCardHeader,
    ShutterstockList
  },
  name:'cardList',
  computed:{
    files(){
      return this.$store.state.files;
    }
  },
  methods:{
      getSize(file){
        return file.size !== void 0 ? file.size : 'md-size-33';
      },
      getInnerSize(file){
        return file.size !== void 0 ? 'md-size-33' : 'md-size-100';
      },
      isLoading(file){
        return file.loading;
      },

      getTags(labels){
        return _.reduce(labels,(accumulator,label)=>{
          return `${accumulator} ${label.Name}, `
        }," ")
      },
      findShutterstockImages(file){
        this.$store.dispatch('findShutterstockImages',file)
      },
      deleteImage(key){
        this.$store.dispatch('deleteImage',key)
      },
      detectLabels(name){
        this.$store.dispatch('detectLabels',name)
      }
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
  .list__card{
    flex: 1;
    flex-basis: 33%;
    max-height: 60em;
  }
  .list__shutterstock{
    flex: 1;
    flex-basis: 77%;
    max-height: 60em;
    overflow-y: scroll;
  }
</style>

