<template>this is the blog post with id {{ this.blogPostId }} page</template>

<script>
export default {
  name: "BlogPostPage",
  data() {
    return {
      blogPostId: "",
    };
  },
  created() {
    this.blogPostId = this.$route.params.blogPostId;
  },
};
</script>

<style scoped></style>
