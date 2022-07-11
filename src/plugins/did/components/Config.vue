<script setup>
import { ref, reactive, computed, watch } from 'vue';

const props = defineProps(['modelValue', 'proposal']);
const emit = defineEmits(['update:modelValue']);
const input = reactive(props.modelValue);
const isValid = computed(() => {
  return (input.issuer && input.vcSchema) || input === {};
});

watch(input, () => {
  emit('update:modelValue', input);
});
</script>

<template>
  <div class="mb-2 text-center">
    <h4 class="mb-3">{{ $t('did.vcRequirement') }}</h4>
    <div v-if="!preview" class="space-y-2">
      <BaseButton class="w-full">
        <input
          v-model="input.issuer"
          class="input w-full text-center"
          :placeholder="$t('did.issuer')"
          required
        />
      </BaseButton>
      <BaseButton class="w-full">
        <input
          v-model="input.vcSchema"
          class="input w-full text-center"
          :placeholder="$t('did.vcSchema')"
          required
        />
      </BaseButton>
    </div>
  </div>
</template>
