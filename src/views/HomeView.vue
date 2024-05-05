<template>
  <div class="home">
<!--    <img alt="Vue logo" src="../assets/logo.png">-->
    <div>
      <label>
        Switch:
        <input type="checkbox" v-model="isChecked">
      </label>
      <p>Switch is {{ isChecked ? 'On' : 'Off' }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">

import {ref} from "vue";

const isChecked = ref(false);

// import { Options, Vue } from 'vue-class-component';
// import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
//
// @Options({
//   components: {
//     HelloWorld,
//   },
// })
// export default class HomeView extends Vue {}
</script>
