<template>
      <div class="list__card">
        <md-card md-with-hover>
          <md-card-area md-inset>
            <md-card-media >
              <img style="width:60em;" :id="file.Key" :src="file.src">
            </md-card-media>
            <md-card-actions>
              <md-button @click="getExif(file)" style="width:auto;"> Получить метаданные</md-button>
              <md-button @click="setExif(file,{keywords:getTags(file.labels),description:file.description})" style="width:auto;">Записать метаданные</md-button>

            </md-card-actions>
            <md-card-actions>

              <md-button @click="detectLabels(file.Key)" style="width:auto;">Распознать</md-button>
              <md-button @click="deleteImage(file.Key)" style="width:auto;"> Удалить</md-button>
              <md-button @click="findShutterstockImages(file)" style="width:auto;"> Найти похожие</md-button>

            </md-card-actions>
          </md-card-area>
          <md-card-area>
            <md-card-content>
              <md-progress md-indeterminate  v-show="isLoading(file)"></md-progress>
              <input type="text" v-model="file.description"/>
              <div v-for="tag in file.labels">{{tag.Name}}<button @click="removeTag(tag.Name,file.Key)">X</button></div>
              <div><input v-model="toAdd" type="text"/><button @click="addTag(toAdd,file.Key)"> +</button></div>
              <div v-show="!isLoading(file)">
                <textarea rows="7" :value="getTags(file.labels)" disabled></textarea>
              </div>
            </md-card-content>
          </md-card-area>
        </md-card>
      </div>
</template>

<script>
  import MdCardHeader from "../../node_modules/vue-material/src/components/mdCard/mdCardHeader.vue";
  import MdButton from "../../node_modules/vue-material/src/components/mdButton/mdButton.vue";
  import piexif from "piexifjs"

  export default {
    components: {
      MdButton,
      MdCardHeader,
    },
    name:'imageCard',
    props:['id'],
    computed:{
      file(){
        return _.find(this.$store.state.files,{Key:this.id});
      },
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
      addTag(value,Key){
        this.$store.commit('addTagForFile',{Key,value});
      },
      removeTag(value,Key){
        this.$store.commit('removeTagForFile',{Key,value});
      },
      findShutterstockImages(file){
        this.$store.dispatch('findShutterstockImages', { file, reset: true})
      },
      deleteImage(key){
        this.$store.dispatch('deleteImage',key)
      },
      detectLabels(name){
        this.$store.dispatch('detectLabels',name)
      },
      setExif(file, options){
        const exifObj = piexif.load(file.src);
        try {
          if (_.get(options,'keywords')) exifObj["0th"][piexif.ImageIFD.XPKeywords]=toUTF8Array(options.keywords);
          if(_.get(options,'description')) exifObj["0th"][piexif.ImageIFD.ImageDescription]=options.description;
          delete exifObj['thumbnail'];
          const exifStr  = piexif.dump(exifObj);
          file.src = piexif.insert(exifStr , file.src);
        } catch(err){
          console.error(err);
        }

        function toUTF8Array(str) {
          var utf8 = [];
          for (var i=0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
              utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
              utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
              i++;
              // UTF-16 encodes 0x10000-0x10FFFF by
              // subtracting 0x10000 and splitting the
              // 20 bits of 0x0-0xFFFFF into two halves
              charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                | (str.charCodeAt(i) & 0x3ff))
              utf8.push(0xf0 | (charcode >>18),
                0x80 | ((charcode>>12) & 0x3f),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f));
            }
          }
          const res = [];
          _.forEach(utf8,(element)=>{
            res.push(element);
            res.push(0);
          })
          return res;
        }
      },
      getExif(file){
        const exifObj = piexif.load(file.src);
        console.log(exifObj);
      }
    }
  }
</script>
<style>
  .list__card{
    flex: 1;
    flex-basis: 33%;
    max-height: 60em;
    margin-bottom: 5em;
  }
</style>

