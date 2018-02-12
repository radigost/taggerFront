<template >
  <div class="tag-popover tag-popover__inner">
    <span>{{tag.Name}}</span>
    <span>{{tag.Confidence}}</span>
    <md-button @click="deleteTag">Delete</md-button>
  </div>

</template>

<script>
    export default {
      name: "tag-popover",
      props: {
        "tag": Object,
        "id": String,
      },
      methods: {
          deleteTag() {
            this.$store.commit('removeTagForFile', {
              Key: this.id,
              value: this.tag.Name,
            });
          },
      },
    };
</script>

<style scoped>
  tag-popover__inner{
  }
</style>
