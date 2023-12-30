<template>
  <article
    class="loading-spinner-container d-flex justify-content-center align-items-center gap-2"
  >
    <div class="fw-bold fs-4">Loading...</div>
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </article>
</template>

<script>
export default {
  name: "LoadingSpinner",
};
</script>

<style scoped>
.loading-spinner-container {
  height: 70vh;
}
</style>
