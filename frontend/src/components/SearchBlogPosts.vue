<template>
  <div class="col-12 col-md-10 col-lg-7 m-auto">
    <div class="input-group my-3">
      <input
        id="SearchBlogPosts"
        placeholder="Search"
        type="text"
        class="form-control"
        aria-label="Search BlogPosts"
        v-model="searchTerm"
      />

      <div class="input-group-append">
        <div class="dropdown">
          <button
            class="btn btn-primary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            Sort by
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu dropdown-menu-right">
            <li>
              <a
                class="dropdown-item d-flex justify-content-between"
                href="#"
                id="title"
                @click="$emit('requestKey', 'title')"
                >Title <font-awesome-icon icon="check" v-if="myKey === 'title'"
              /></a>
            </li>
            <li>
              <a
                class="dropdown-item d-flex justify-content-between"
                href="#"
                id="category"
                @click="$emit('requestKey', 'category')"
                >Category
                <font-awesome-icon icon="check" v-if="myKey === 'category'"
              /></a>
            </li>

            <li>
              <a
                class="dropdown-item d-flex justify-content-between"
                href="#"
                id="asc"
                @click="$emit('requestDir', 'asc')"
              >
                Asc
                <font-awesome-icon icon="check" v-if="myDir === 'asc'" />
              </a>
            </li>

            <li>
              <a
                class="dropdown-item d-flex justify-content-between"
                href="#"
                id="desc"
                @click="$emit('requestDir', 'desc')"
              >
                Desc
                <font-awesome-icon icon="check" v-if="myDir === 'desc'" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export default {
  name: "SearchAuthors",
  data() {
    return {
      searchTerm: "",
    };
  },
  // this allows us to track an element as it changes its value
  watch: {
    searchTerm: function () {
      this.$emit("searchRecords", this.searchTerm);
    },
  },
  props: ["myKey", "myDir"],
  components: {
    FontAwesomeIcon,
  },
};
</script>

<style scoped>
.input-group {
  width: 75%;
  margin: auto;
}
</style>
