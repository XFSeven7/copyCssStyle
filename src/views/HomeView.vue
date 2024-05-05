<template>
  <div class="home">
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

</script>
