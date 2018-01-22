<template>
  <div>
    <div class="list list__inner">
      <div v-show="!loading" class="list__row" >
        <div class="list__image" v-for="file in files" :key="file.Key">
          <a @click="goToDetails(file.Key)" >
            <img :id="file.Key" :src="file.src">
          </a>
          <md-button  class="list__image__button--delete md-icon-button md-raised" @click="deleteImage(file.Key)">
            <md-icon>delete</md-icon>
          </md-button>
        </div>

        <div class="list__image list__image--add" @click="document.getElementById('photoupload').click()">
          <input id="photoupload" type="file" name="imgfile" v-on:change="onFileChange" style="display: none;">
          <md-button class="list__image__add-button md-fab md-primary " onclick="document.getElementById('photoupload').click()">
            <md-icon>file_upload</md-icon>
          </md-button>
        </div>
      </div>
      <div v-show="loading">
        <md-progress md-indeterminate></md-progress>
      </div>
    </div>

  </div>
</template>
<script>
import ShutterstockList from './Shutterstock.vue';
import imageCard from './imageCard.vue';
import MdButton from "../../node_modules/vue-material/src/components/mdButton/mdButton.vue";
import MdProgress from "../../node_modules/vue-material/src/components/mdProgress/mdProgress.vue";

export default {
  components: {
    ShutterstockList,
    imageCard,
    MdButton,
    MdProgress,
  },
  name: 'cardList',
  computed: {
    files() {
      return this.$store.state.files;
    },
    loading(){
      return this.$store.state.loadingImageList;
    },
  },
  methods: {
    goToDetails(key) {
      this.$router.replace({ name: 'Detail', params: { key } });
    },
    onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      const file = _.head(document.getElementById('photoupload').files);
      this.$store.dispatch('uploadFile', file);
    },
    deleteImage(key) {
      this.$store.dispatch('deleteImage', key);
    },
  },
};
</script>
<style>
 .list__inner{
   display: flex;
   flex-flow: column;
 }
  .list__row{
    display: flex;
    flex-flow: row;
    margin-left:2em;
    flex-wrap: wrap;
  }
  .list__image{
    overflow: hidden;
    margin: 2em;
    border-radius: 1em;
  }
  .list__image:hover{
    /*box-shadow:         3px 3px 5px 6px #ccc;*/
    /*cursor: pointer;*/
  }
  .list__image--add{
    position: relative;
    height: 20em;
    width: 20em;
  }
  .list__image__add-button{
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
  }
 .list__image img{
   object-fit: cover; /* Do not scale the image */
   object-position: center; /* Center the image within the element */
   height: 20em;
   width: 20em;
   border-radius: 1em;
   margin: 1em;
 }

 .list__image img:hover{
   box-shadow:         3px 3px 5px 6px #ccc;
   cursor: pointer;
 }

 .list__image__button--delete{

 }
</style>

