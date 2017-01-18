<template>
  <div class="example">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
export default {
  name: 'example',
  data() {
    return {
      msg: 'This is example component.',
    };
  },
};
</script>

<style lang="scss">
.example {
  background-color: red;
}
</style>
