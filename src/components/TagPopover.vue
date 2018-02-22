<template>
  <div class="tag-popover tag-popover__inner">
    <div>{{tag.Name}}</div>
    <div v-show="tag.translatedName !== void 0 ">
      <b>Перевод: &nbsp;</b>
      <span v-for="name in tag.translatedName">
        {{name}}
      </span>
    </div>
    <md-button @click="deleteTag"> <md-icon>delete</md-icon></md-button>
    <md-button @click="translateTag">Перевести</md-button>
  </div>

</template>

<script>
  export default {
    name: 'tag-popover',
    props: {
      'tag': {
        Name:String,
        Confidence:Number,
        translatedName:String
      },
      'id': String,
    },
    methods: {
      deleteTag() {
        this.$store.commit('removeTagForFile', {
          Key: this.id,
          value: this.tag.Name,
        });
      },
      translateTag() {
        this.$store.dispatch('translateTag', {
          Key: this.id,
          tag: this.tag,
        });
      }
    },
  };
</script>

<style scoped>
  tag-popover__inner {
  }
</style>
