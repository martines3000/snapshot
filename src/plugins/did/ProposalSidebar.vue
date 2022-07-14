<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { pluginIndex } = usePlugins();

defineProps({ proposal: Object });
const msg = 'This is DID Plugin!';
</script>

<template>
  <BaseBlock v-if="proposal.plugins?.did" :title="pluginIndex.did.name">
    <div :style="{ color: 'white' }">Accepted issuer:</div>
    <div :style="{ wordWrap: 'break-word' }">
      {{ proposal.plugins.did.issuer }}
    </div>

    <div :style="{ marginTop: '8px', color: 'white' }">Accepted schema:</div>
    <div :style="{ wordWrap: 'break-word' }">
      {{ proposal.plugins.did.vcSchema }}
    </div>
  </BaseBlock>
</template>
