<template>
    <div id="app">
        <img src="./images/logo.svg">
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
