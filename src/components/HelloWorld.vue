<template>
  <div class="hello">
    <h1>Теггер v 0.1</h1>
    <div class ="md-layout md-gutter" >
      <div class="md-layout-item md-size-33" v-for="file in files">
        <md-card>
          <md-card-area md-inset>
            <md-card-media-cover md-text-scrim>
              <!--<md-card-header-text>-->
              <!--<div class="md-title">{{file.Key}}</div>-->
              <!--<div class="md-subhead">Big size</div>-->
              <!--</md-card-header-text>-->

              <md-card-media style="max-width: 20em;">
                <img :id="file.Key" >
                <!--<img src="/assets/examples/cover.png" alt="People">-->
              </md-card-media>
            </md-card-media-cover>
            <md-card-actions>
              <md-button @click="detectLabels(file.Key)">Распознать</md-button>
              <md-button @click="deleteImage(file.Key)"> Удалить</md-button>
            </md-card-actions>
          </md-card-area>
          <md-card-area>
            <md-card-content>
              <md-progress-spinner v-show="isLoading(file)" class="md-accent" md-mode="indeterminate"></md-progress-spinner>

              <span v-for="label in file.labels">
            <span>{{label.Name}} - {{label.Confidence.toFixed(2)}}%</span>,
          </span>
            </md-card-content>
          </md-card-area>


          <md-card-content>
            <!--<textarea :value="getTags(file.labels)"></textarea></md-card-content>-->
            <md-field>
              <!--<label>Textarea with Autogrow</label>-->
              <md-textarea rows="7" :value="getTags(file.labels)"></md-textarea>
            </md-field>
          </md-card-content>
        </md-card>
      </div>
      <div class="md-layout-item md-size-33">
        <p>File name:
          <input id="photoupload" type="file" name="imgfile" v-on:change="onFileChange" style="display: none;">
          <br>
          <md-button class="md-fab md-primary" onclick="document.getElementById('photoupload').click();">
            <md-icon>+</md-icon>
          </md-button>

          <!--<md-button type="button" value="Browse..." onclick="document.getElementById('photoupload').click();" />-->

        </p>
      </div>


    </div>



        <!--<button @click="buckets">ЗАЛИТЬ</button>-->

  </div>
</template>

<script>
  import * as _ from 'lodash'
  import MdCardArea from "../../node_modules/vue-material/src/components/MdCard/MdCardArea/MdCardArea.vue";
  import MdCardContent from "../../node_modules/vue-material/src/components/MdCard/MdCardContent/MdCardContent.vue";
  const AWS = require('aws-sdk');
  const credentials = require('../credentials.json');
  AWS.config.credentials = new AWS.Credentials(credentials);;
  AWS.config.region = credentials.region;


  const s3 = new AWS.S3({
    params: {Bucket: credentials.Bucket}
  });
  const rekognition = new AWS.Rekognition();

  export default {
    components: {
      MdCardContent,
      MdCardArea},
    name: 'HelloWorld',
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        rekognition,
        s3,
        files:[],
        labels:[]
      };
    },
    created(){
      this.listObjects();
    },
    methods:{
      getTags(labels){
        return _.reduce(labels,(accumulator,label)=>{
          return `${accumulator} ${label.Name}, `
        }," ")
      },
      isLoading(file){
        return file.loading;
      },
      onFileChange(e){
          var files = e.target.files || e.dataTransfer.files;
          if (!files.length) return;
//          this.createImage(files[0]);
          this.buckets();
      },
      deleteImage(key){
//        console.log(`deleteng ${key}`,this.files);
        const params = {
          Bucket: credentials.Bucket,
          Key: key
        };
        s3.deleteObject(params, (err, data)=> {
          if (err) console.log(err, err.stack); // an error occurred
          else    {
            this.files =  _.reduce(this.files,(accumulator,file)=> {
              if (file.Key!==key) accumulator.push(file);
              return accumulator;
            },[]);
          }
        });
      },
      async getImage(image){
        const retrieveImage = async (key)=>{
          const params = {
            Key: key,
            Bucket: credentials.Bucket,
          };

          return new Promise((resolve)=>{
            s3.getObject(params,(err,_data)=>{

              resolve(_data.Body);

            });
          })

        };
        const Uint8ToString = (u8a)=>{
          var CHUNK_SZ = 0x8000;
          var c = [];
          for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
            c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
          }
          return c.join("");
        };

        const retrievedImage = await retrieveImage(image.Key);
        const  b64encoded = btoa(Uint8ToString(retrievedImage));
        const preview = document.getElementById(image.Key);
        preview.src = `data:image/jpeg;base64,${b64encoded}`;
        return image;

      },
      listObjects(){
        const  params = {
          Bucket: credentials.Bucket,
        };
        s3.listObjects(params,  (err, data)=> {
          if (err) console.log(err, err.stack); // an error occurred
          else  {
            this.files = data.Contents;
            this.files = _.map(this.files,file=>_.assign(file,{loading:true}));
            _.forEach(this.files,async (image)=>{
              await this.getImage(image);
            });
            this.files = _.map(this.files,file=>_.assign(file,{loading:false}));
          }
        });
      },
      buckets(){
        const files = document.getElementById('photoupload').files;
        const file = files[0];
        const params = {
          Key: file.name,
          Body: file,
          ACL: 'public-read-write'
        };

        s3.upload(params, (err, data)=> {
          if (err) {
            return console.error('There was an error uploading your photo: ', err.message);
          }
          console.log('Successfully uploaded photo.',data);
          this.files.push(data);
          this.getImage(data);
        });
      },
      async detectLabels(name){
        const  doDetect = (name)=> {
          return new Promise((resolve,reject)=>{
            const params = {
              Image: {
                S3Object: {
                  Bucket: credentials.Bucket,
                  Name: name
                }
              },
              MaxLabels: 123,
              MinConfidence: 70
            };

            rekognition.detectLabels(params, (err, data)=> {
              if (err) reject(err, err.stack); // an error occurred
              else {
                console.log(data);
                resolve(data.Labels);
              }
            });
          })
        }

        console.info(`detecting image for ${name}`);
        try {
          this.files = _.map(this.files,(file)=>file.Key===name ? _.assign(file,{loading:true}) : file )
          const labels = await doDetect(name);
          this.files = _.map(this.files,(file)=>file.Key===name ? _.assign(file,{labels,loading:false}) : file )
        }
        catch(err) {
          console.error(err,err.stack);
        }

      }
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
