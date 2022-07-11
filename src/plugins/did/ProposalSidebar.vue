<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { pluginIndex } = usePlugins();

defineProps({ proposal: Object });
const msg = 'This is DID Plugin!';
</script>

<template>
  <BaseBlock v-if="proposal.plugins?.did" :title="pluginIndex.did.name">
    <div>Accepted issuer:</div>
    <div>{{ proposal.plugins.did.issuer }}</div>
    <div>Accepted schema:</div>
    <div>{{ proposal.plugins.did.vcSchema }}</div>
  </BaseBlock>
</template>
