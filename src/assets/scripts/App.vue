<template>
    <div id="app">
        <svg class="logo"><use xlink:href="#logo"></use></svg>
        <example></example>
    </div>
</template>

<script>
import Example from './components/Example.vue';

export default {
  name: 'app',

  components: {
    Example,
  },
};
</script>

<style lang="scss">
  .logo {
    width: 50px;
    height: 50px;
  }
</style>
