<script>
export default {
  props: ['proposal'],
  data() {
    return {
      plugin: 'test'
    };
  }
};
</script>

<template>
  <Block :title="$t('did.customBlock.title')">
    <div>
      <b>Test</b>
      <a :href="example.com" target="_blank" class="float-right">
        {{ proposal.plugins.did.issuer.slice(0, 15) }}
        <Icon name="external-link" class="ml-1" />
      </a>
    </div>
    <div>
      <b>VC Schema</b>
      <span class="link-color float-right">
        {{ proposal.plugins.did.verifiableCredentialSchema.slice(0, 15) }}
      </span>
    </div>
  </Block>
</template>
