<script setup>
import DIDConfig from './components/Config.vue';
import { usePlugins } from '@/composables/usePlugins';

const { pluginIndex } = usePlugins();

defineProps({
  space: Object,
  proposal: Object,
  modelValue: Object
});
const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'did', form });
};
</script>

<template>
  <BaseBlock :title="pluginIndex.did.name">
    <DIDConfig
      v-if="space.plugins.did"
      :proposal="proposal"
      :model-value="
        modelValue?.did || {
          issuer: '',
          vcSchema: ''
        }
      "
      @update:modelValue="update"
    />
  </BaseBlock>
</template>
