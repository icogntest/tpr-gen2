<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {askWebsiteReady} from '#preload';

const websiteReady = ref('pending');

onMounted(() => {
  askWebsiteReady().then((response: boolean) => {
    console.log(`responseIfReady:${response}`);
    websiteReady.value = String(response);
  });
});
</script>

<template>
  <div>ExampleComp</div>
  <div>websiteReady: {{ websiteReady }}</div>
  <!-- <button @click="count++"> count is: {{ count }}</button> -->
</template>
