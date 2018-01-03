<template>
  <div>
    <div class="list list__inner">
      <div class="list__row" >
        <a  class="list__image" @click="goToDetails(file.Key)" v-for="file in files" :key="file.Key">
          <img  :id="file.Key" :src="file.src">
        </a>
        <a class="list__image list__image--add" onclick="document.getElementById('photoupload').click();">
          <input id="photoupload" type="file" name="imgfile" v-on:change="onFileChange" style="display: none;">
          <md-button class="list__image__add-button md-fab md-primary " onclick="document.getElementById('photoupload').click();">
            <md-icon>file_upload</md-icon>
          </md-button>
        </a>
      </div>
    </div>

  </div>
</template>
<script>
import ShutterstockList from './Shutterstock.vue'
import imageCard from './imageCard.vue'


export default {
  components: {
    ShutterstockList,
    imageCard
  },
  name:'cardList',
  computed:{
    files(){
      return this.$store.state.files;
    }
  },
  methods:{
    goToDetails(key){
      console.log(key)
      this.$router.replace({ name: 'Detail', params: { key }});
    },
    onFileChange(e){
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      const file = _.head(document.getElementById('photoupload').files);
      this.$store.dispatch('uploadFile',file)
    },
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
    margin-left:2em;
    /*justify-content: space-around;*/
  }

  .list__image{
    /*flex-basis: 25%;*/

    overflow: hidden;
    /*border:1px solid darkblue;*/
    margin: 2em;
    border-radius: 1em;

    /*width: 30em;*/
  }
  .list__image:hover{
    box-shadow:         3px 3px 5px 6px #ccc;
    cursor: pointer;
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
 }
</style>

