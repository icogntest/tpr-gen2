<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {askDbReady, askWebsiteReady} from '#preload';

const dbReady = ref('pending');
const websiteReady = ref('pending');

onMounted(() => {
  askDbReady().then((response: boolean) => {
    console.log(`dbResponseIfReady:${response}`);
    dbReady.value = String(response);
  });

  askWebsiteReady().then((response: boolean) => {
    console.log(`websiteResponseIfReady:${response}`);
    websiteReady.value = String(response);
  });
});
</script>

<template>
  <div>ExampleComp</div>
  <div>dbReady: {{ dbReady }}</div>
  <div>websiteReady: {{ websiteReady }}</div>
  <!-- <button @click="count++"> count is: {{ count }}</button> -->
</template>
