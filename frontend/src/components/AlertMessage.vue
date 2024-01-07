<template>
  <div class="alert fw-bold" :class="alertType" role="alert">
    {{ msg }}
  </div>
</template>

<script>
export default {
  // -> numele componentei
  name: "ErrorMessage",
  // -> proprietatile componentei
  props: ["msg", "alertType"],
};
</script>

<style scoped></style>
