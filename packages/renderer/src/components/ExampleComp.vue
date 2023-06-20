<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {cancelAutoInstall, askDbReady, askWebsiteReady} from '#preload';

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

function doCancelAutoInstall() {
  console.log('cancel auto install');
  cancelAutoInstall();
}
</script>

<template>
  <div>ExampleComp</div>
  <div>dbReady: {{ dbReady }}</div>
  <div>websiteReady: {{ websiteReady }}</div>
  <button @click="doCancelAutoInstall">cancelAutoInstall</button>
</template>
