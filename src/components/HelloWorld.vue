<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <img src="" height="100" alt="Image preview...">
    <table class="pictures">
      <tr v-for="file in files">
        <td>
          <img :id="file.Key" height="100">
          {{file.Key}}
        </td>
        <td>
          <button @click="detectLabels(file.Key)">Распознать </button>
          <button @click="deleteImage(file.Key)">Удалить</button>
        </td>
        <td>
          <span v-for="label in file.labels">
            <span>{{label.Name}} - {{label.Confidence.toFixed(2)}}%</span>,
          </span>
        </td>
        <td>
          <textarea :value="getTags(file.labels)"></textarea>
        </td>

      </tr>
      <tr>
        File name:<input id="photoupload" type="file" name="imgfile"><br>
        <button @click="buckets">ЗАЛИТЬ</button>
      </tr>
    </table>

  </div>
</template>

<script>
  import * as _ from 'lodash'
  const AWS = require('aws-sdk');
  const credentials = require('../credentials.json');
  AWS.config.credentials = new AWS.Credentials(credentials);;
  AWS.config.region = credentials.region;


  const s3 = new AWS.S3({
    params: {Bucket: credentials.Bucket}
  });
  const rekognition = new AWS.Rekognition();

  export default {
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
      },
      listObjects(){
        const  params = {
          Bucket: credentials.Bucket,
        };
        s3.listObjects(params, (err, data)=> {
          if (err) console.log(err, err.stack); // an error occurred
          else  {
            this.files = data.Contents;
            _.forEach(data.Contents,(image)=>this.getImage(image));
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
          const labels = await doDetect(name);
          this.files = _.map(this.files,(file)=>file.Key===name ? _.assign(file,{labels}) : file )
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
