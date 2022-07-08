<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { pluginIndex } = usePlugins();

defineProps({ proposal: Object });
const msg = 'This is DID Plugin!';
</script>

<template>
  <div>
    <h1>DID Plugin</h1>
    <div>{{ msg }}</div>
  </div>
</template>
