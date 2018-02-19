<template>
  <div class="list__card">
    <md-card md-with-hover>
      <md-card-area md-inset>
        <md-card-media>
          <img class="image-card__image" :id="file.Key" :src="file.src">
        </md-card-media>
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
          <div><input v-model="toAdd" type="text"/>
            <button @click="addTag(toAdd,file.Key)"> +</button>
          </div>
        </md-card-content>

        <md-card-content>
          <md-progress md-indeterminate v-show="isLoading(file)"></md-progress>
          <hr class="image-card__hr">
          <div class="image-card__result" v-show="!isLoading(file)">

            <label>Заголовок</label>
            <input class="image-card__input image-card__input--caption" type="text" v-model="file.caption"/>
            <label>Описание</label>
            <input class="image-card__input image-card__input--caption" type="text" v-model="file.description"/>
            <label>Тэги</label>
            <div class="image-card__input" >
              <div class="popover-container" v-for="label in file.labels">
                <v-popover>
                  <a>{{label.Name}}, &nbsp;</a>
                  <template slot="popover">
                    <tag-popover :tag="label" :id="file.Key"/>
                  </template>
                </v-popover>
              </div>
            </div>

            <md-button class="align-left"
                       @click="setExif(file,{tags:getTags(file.labels),description:file.description})"
                       style="width:auto;">Записать данные
            </md-button>

            <md-button class="align-left" v-bind:href="file.src" download v-bind:disabled="!canDownload">Скачать</md-button>
          </div>
        </md-card-content>
      </md-card-area>
    </md-card>
  </div>
</template>

<script>
  import MdCardHeader from '../../node_modules/vue-material/src/components/mdCard/mdCardHeader.vue';
  import MdButton from '../../node_modules/vue-material/src/components/mdButton/mdButton.vue';
  import piexif from 'piexifjs';
  import TagPopover from './TagPopover';

  export default {
    components: {
      MdButton,
      MdCardHeader,
      TagPopover,
    },
    name: 'imageCard',
    props: ['id'],
    data() {
      return {
        toAdd: '',
        canDownload: false,
      };
    },
    computed: {
      file() {
        {

        }
        return _.find(this.$store.state.files, { Key: this.id });
      },
    },
    methods: {
      downloadFile(src) {
        window.open(src, 'blank');
        // Convert the Base64 string back to text.
        var txt = atob(data.src);

// Blob for saving.
        var blob = new Blob([byteString], { type: 'text/plain' });

// Tell the browser to save as report.txt.
        saveAs(blob, 'report.txt');
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
        this.$store.commit('resetKeywords', { Key: file.Key });
        this.$store.dispatch('findShutterstockImages', { file, reset: true });
      },
      deleteImage(key) {
        this.$store.dispatch('deleteImage', key);
      },
      detectLabels(name) {
        this.$store.dispatch('detectLabels', name);
      },
      setExif(file, options) {
        const exifObj = piexif.load(file.src);
        try {
          if (_.get(options, 'keywords')) exifObj['0th'][piexif.ImageIFD.XPKeywords] = toUTF8Array(options.tags);
          if (_.get(options, 'description')) exifObj['0th'][piexif.ImageIFD.ImageDescription] = options.description;
          if (_.get(options, 'caption')) exifObj['0th'][piexif.ImageIFD.DocumentName] = options.caption;
          delete exifObj['thumbnail'];
          const exifStr = piexif.dump(exifObj);
          file.src = piexif.insert(exifStr, file.src);
          this.canDownload = true;
        } catch (err) {
          console.error(err);
        }

        function toUTF8Array(str) {
          var utf8 = [];
          for (var i = 0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 0x80) {
              utf8.push(charcode);
            } else if (charcode < 0x800) {
              utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
              utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
              i++;
              // UTF-16 encodes 0x10000-0x10FFFF by
              // subtracting 0x10000 and splitting the
              // 20 bits of 0x0-0xFFFFF into two halves
              charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                | (str.charCodeAt(i) & 0x3ff));
              utf8.push(0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
            }
          }
          const res = [];
          _.forEach(utf8, (element) => {
            res.push(element);
            res.push(0);
          });
          return res;
        }
      },
      getExif(file) {
        const exifObj = piexif.load(file.src);
      },
    },
  };

</script>
<style>
  .list__card {
    /*position: sticky;*/
    /*top:2em;*/
    max-height: 60em;
    margin-bottom: 5em;
    flex-basis: 33%;
  }

  .md-card .md-card-media img {
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

  .image-card__image {

  }

  .image-card__chips {
    display: flex;
  }

  .image-card__result {
    display: flex;
    flex-direction: column;
    align-items: left;
  }

  .image-card__input {
    width: 100%;
    border-radius: 4px;
    background-color: white;
    border: 1px solid lightgray;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    padding-left: 0.5em;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 0.5em;
  }
  .image-card__input--caption{
      font-size: large;
  }


  .image-card__hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
  }

  .align-left {
    align-self: flex-end;
  }

  .popover-container {
    display: flex;
    flex-direction: row;
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

