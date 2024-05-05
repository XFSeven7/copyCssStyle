<template>
  <div class="home">
    <div style="width: 100px;display: flex;align-items: center">
      <div>功能开关:</div>
      <input type="checkbox" v-model="isChecked">
    </div>

  </div>
</template>

<script setup lang="ts">

import {ref} from "vue";

const isChecked = ref(false);

</script>
