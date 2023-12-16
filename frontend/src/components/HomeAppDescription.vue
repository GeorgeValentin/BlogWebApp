<template>
  <article class="container-fluid">
    <div
      class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3"
    >
      <!-- <header>
        <h2 class="fw-bold fs-2 m-0"> List</h2>
      </header> -->
    </div>

    <div class="home-page row justify-content-center py-3 px-0">
      <div
        class="card-container text-center col-xxl-6 col-xl-4 col-md-12 col-sm-4 p-0"
        v-for="element in elements"
        :key="element"
      >
        <div class="card border-2 border-light rounded-0" style="width: 20rem">
          <div class="card-body">
            <div class="text-center">
              <img />
            </div>
            <header>
              <h5 class="card-title fs-4 fw-bold mb-5 mt-2">
                Writing your own stories
              </h5>
            </header>

            <div
              class="d-flex justify-content-between align-items-center border border-2 border-light p-2 my-2"
            >
              <div class="fw-bold">Nationality:</div>
              <div>some text</div>
            </div>

            <div
              class="d-flex justify-content-between align-items-center border border-2 border-light p-2 my-2"
            >
              <div class="fw-bold">BirthDay:</div>
              some text
            </div>

            <div
              class="d-flex justify-content-between align-items-center border border-2 border-light p-2 my-2"
            >
              <div class="fw-bold">Gender:</div>
              some text
            </div>

            <div
              class="d-flex justify-content-between align-items-center border border-2 border-light p-2 my-2"
            >
              <div class="fw-bold">Main Genre:</div>
              some text
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: "HomeAppDescription",
  data() {
    return {
      elements: [1, 2, 3],
    };
  },
};
</script>

<style scoped>
.card-container {
  flex-basis: fit-content;
}

.card-container:hover {
  scale: 1.02;
}

.card {
  background-color: #0c2461;
  color: #c7ecee;
}

.card:hover {
  background-color: #0a3d62;
  color: #dff9fb;
}
</style>
