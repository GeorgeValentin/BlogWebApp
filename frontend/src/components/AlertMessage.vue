<template>
  <div class="alert fw-bold" :class="alertType" role="alert">
    {{ msg }}
  </div>
</template>

<script>
export default {
  name: "ErrorMessage",
  props: ["msg", "alertType"],
};
</script>

<style scoped></style>
