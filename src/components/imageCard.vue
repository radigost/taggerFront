npm<template>
      <div class="list__card">
        <md-card md-with-hover>
          <md-card-area md-inset>
            <md-card-media >
              <img class="image-card__image" :id="file.Key" :src="file.src">
            </md-card-media>
            <md-card-actions>
              <md-button @click="getExif(file)" style="width:auto;"> Получить метаданные</md-button>

            </md-card-actions>
            <md-card-actions>
              <md-button @click="detectLabels(file.Key)" style="width:auto;">Распознать</md-button>
              <md-button @click="deleteImage(file.Key)" style="width:auto;">
                <md-icon>delete</md-icon>
              </md-button>
              <md-button @click="findShutterstockImages(file)" style="width:auto;"> Найти похожие</md-button>
            </md-card-actions>
          </md-card-area>
          <md-card-area>

            <md-card-content>
              <div><input v-model="toAdd" type="text"/><button @click="addTag(toAdd,file.Key)"> +</button></div>
            </md-card-content>

            <md-card-content>
              <md-progress md-indeterminate  v-show="isLoading(file)"></md-progress>
              <hr class="image-card__hr">
              <div class="image-card__result" v-show="!isLoading(file)">

                <label>Заголовок</label>
                <input class="image-card__input" type="text" v-model="file.description"/>
                <!--<div v-for="tag in file.labels">{{tag.Name}}<button @click="removeTag(tag.Name,file.Key)">X</button></div>-->
                <label>Тэги</label>
                <div class="image-card__input image-card__input--textarea" rows="7"  disabled>
                  <div class="popover-container" v-for="label in file.labels">
                    <v-popover>
                      <a>{{label.Name}},&nbsp</a>
                      <template slot="popover">
                        <tag-popover :tag="label" :Key="file.Key"/>
                      </template>
                    </v-popover>
                  </div>

                </div>

                <md-button class="align-left" @click="setExif(file,{keywords:getTags(file.labels),description:file.description})" style="width:auto;">Записать данные</md-button>
                <md-button @click="downloadFile(file.src)" class="align-left">Скачать</md-button>
              </div>

            </md-card-content>
          </md-card-area>
        </md-card>
      </div>
</template>

<script>
  import MdCardHeader from "../../node_modules/vue-material/src/components/mdCard/mdCardHeader.vue";
  import MdButton from "../../node_modules/vue-material/src/components/mdButton/mdButton.vue";
  import piexif from "piexifjs";
  import TagPopover from './TagPopover';

  export default {
    components: {
      MdButton,
      MdCardHeader,
      TagPopover,
    },
    name: 'imageCard',
    props: ['id'],
    computed: {
      file() {
        return _.find(this.$store.state.files, { Key: this.id });
      },
    },
    methods: {
      downloadFile(src) {
        window.open(src, 'blank');
      },
      isLoading(file) {
        return file.loading;
      },

      getTags(labels) {
        return _.reduce(labels, (accumulator, label) => {
          return `${accumulator} ${label.Name}, `;
        }, ' ');
      },
      addTag(value, Key) {
        this.$store.commit('addTagForFile', { Key, value });
      },
      removeTag(value, Key) {
        this.$store.commit('removeTagForFile', { Key, value });
      },
      findShutterstockImages(file) {
        this.$store.dispatch('findShutterstockImages', { file, reset: true });
      },
      deleteImage(key){
        this.$store.dispatch('deleteImage', key);
      },
      detectLabels(name){
        this.$store.dispatch('detectLabels', name);
      },
      setExif(file, options) {
        const exifObj = piexif.load(file.src);
        try {
          if (_.get(options, 'keywords')) exifObj['0th'][piexif.ImageIFD.XPKeywords] = toUTF8Array(options.keywords);
          if (_.get(options, 'description')) exifObj['0th'][piexif.ImageIFD.ImageDescription] = options.description;
          delete exifObj['thumbnail'];
          const exifStr = piexif.dump(exifObj);
          file.src = piexif.insert(exifStr, file.src);
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
      },
    },
  }

</script>
<style>
  .list__card{
    /*position: sticky;*/
    /*top:2em;*/
    flex: 1;
    flex-basis: 33%;
    max-height: 60em;
    margin-bottom: 5em;
  }
  .md-card .md-card-media img{
    object-fit: cover; /* Do not scale the image */
    object-position: center; /* Center the image within the element */
    max-height: 30em;
    max-width: 30em;
    /*height: 20em;*/
    /*width: 20em;*/
    border-radius: 1em;
    margin: 1em;
    /*width:auto;*/
  }
  .image-card__image{

  }

  .image-card__chips{
    display: flex;
  }

  .image-card__result{
    display: flex;
    flex-direction: column;
    align-items: left;
  }

  .image-card__input{
    width: 100%;
  }

  .image-card__input--textarea{
    border-radius: 4px;
    background-color: white;
    border: 1px solid lightgray;
    padding-top:1em;
    padding-left: 0.5em;
    display: flex;
    flex-direction: row;
  }

  .image-card__hr{
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
  }

  .align-left{
    align-self: right;
  }

  .popover-container{
    display: flex;
    flex-direction: row;
    flex-basis: 10%;
  }
  .tooltip {
    z-index: 2;
    margin-left: 20em;
    background-color: #fafafa;
    border-radius: 0.5em;
    border: 1px solid #2c3e50;
    padding: 0.5em;

  }
  .tooltip .popover {
     color: #f9f9f9;

  }
  .tooltip .popover .popover-inner {
    /*background:#f9f9f9;*/
    /*color: black;*/
    /*padding: 24px;*/
    /*border-radius: 5px;*/
    /*box-shadow: 0 5px 30px rgba(black, .1);*/
  }

  .tooltip .popover .popover-arrow {
    border-color: #f9f9f9;
    z-index: 1;
  }

</style>

