<script setup>
import { computed, inject, ref, watch } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { shorten, getChoiceString, explorerUrl } from '@/helpers/utils';
import { useClient } from '@/composables/useClient';
import { useIntl } from '@/composables/useIntl';
import { getPower } from '@/helpers/snapshot';
import { useWeb3 } from '@/composables/useWeb3';
import pending from '@/helpers/pending.json';
import {
  isSnapInstalled,
  installSnap,
  getVCs,
  getVP
} from '@/helpers/ssi-snap';

const { web3Account } = useWeb3();

const vp = ref(0);
const vpByStrategy = ref([]);
const vpLoading = ref(false);
const vpLoadingFailed = ref(false);
const vpLoaded = ref(false);

const props = defineProps({
  open: Boolean,
  space: Object,
  proposal: Object,
  selectedChoices: [Object, Number],
  snapshot: String,
  strategies: Object
});

const emit = defineEmits(['reload', 'close']);

const { t } = useI18n();
const notify = inject('notify');
const { send, clientLoading } = useClient();
const format = getChoiceString;
const { formatNumber, formatCompactNumber } = useIntl();

const symbols = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol || '')
);

const vcs = ref([]);
const selectedVC = ref(null);
const generatedVP = ref(null);
const verifyingVP = ref(false);

async function handleSubmit() {
  let result;

  // DID PLUGIN
  if (Object.keys(props.proposal.plugins).includes('did')) {
    result = await send(props.space, 'vote', {
      proposal: props.proposal,
      choice: props.selectedChoices,
      vp: generatedVP.value
    });
  } else {
    result = await send(props.space, 'vote', {
      proposal: props.proposal,
      choice: props.selectedChoices
    });
  }

  console.log('Result', result);
  if (result.id) {
    notify(['green', t('notify.voteSuccessful')]);
    if (!pending.includes(props.space.id)) {
      emit('reload');
    }
    emit('close');
  }
}

watch(
  () => [selectedVC.value],
  async () => {
    if (selectedVC.value) {
      const index = vcs.value.findIndex(vc => vc === selectedVC.value);
      if (index === -1) return;
      generatedVP.value = await getVP(index);

      if (!generatedVP.value) selectedVC.value = null;
    }
  }
);

watch(
  () => [props.open, web3Account.value, selectedVC.value, generatedVP.value],
  async () => {
    if (props.open === false) return;
    vpLoading.value = true;
    vpLoadingFailed.value = false;
    try {
      let response;
      // DID PLUGIN
      if (Object.keys(props.proposal.plugins).includes('did')) {
        vcs.value = await getVCs();
        if (selectedVC.value && generatedVP.value && !verifyingVP.value) {
          verifyingVP.value = true;
          response = await getPower(
            props.space,
            web3Account.value,
            props.proposal,
            generatedVP.value
          );

          vp.value = response.totalScore;
          vpByStrategy.value = response.scoresByStrategy;
        } else {
          vp.value = 0;
        }
      } else {
        response = await getPower(
          props.space,
          web3Account.value,
          props.proposal
        );

        vp.value = response.totalScore;
        vpByStrategy.value = response.scoresByStrategy;
      }
    } catch (e) {
      vpLoadingFailed.value = true;
      console.log(e);
    } finally {
      vpLoaded.value = true;
      vpLoading.value = false;
      verifyingVP.value = false;
    }
  }
);
</script>

<template>
  <BaseModal
    :open="open"
    :show-close="false"
    class="flex"
    @close="$emit('close')"
  >
    <div class="flex flex-auto flex-col">
      <h4 class="m-4 mb-0 text-center">
        {{ $tc('voteOverview') }}
      </h4>
      <BaseBlock slim class="m-4 p-4 text-skin-link">
        <div class="flex">
          <span class="mr-1 flex-auto text-skin-text" v-text="$t('options')" />
          <span
            v-tippy="{
              content:
                format(proposal, selectedChoices).length > 30
                  ? format(proposal, selectedChoices)
                  : null
            }"
            class="ml-4 truncate text-right"
          >
            {{ format(proposal, selectedChoices) }}
          </span>
        </div>
        <div class="flex">
          <span class="mr-1 flex-auto text-skin-text" v-text="$t('snapshot')" />
          <BaseLink
            :link="explorerUrl(proposal.network, proposal.snapshot, 'block')"
            class="float-right"
          >
            {{ formatNumber(proposal.snapshot) }}
          </BaseLink>
        </div>
        <div class="flex">
          <span
            class="mr-1 flex-auto text-skin-text"
            v-text="$t('votingPower')"
          />
          <span v-if="vpLoadingFailed" class="item-center flex">
            <BaseIcon name="warning" size="22" class="text-red" />
          </span>
          <span
            v-else-if="vpLoaded && !vpLoading"
            v-tippy="{
              content: vpByStrategy
                .map(
                  (score, index) =>
                    `${formatCompactNumber(score)} ${symbols[index]}`
                )
                .join(' + ')
            }"
          >
            {{ formatCompactNumber(vp) }}
            {{ shorten(proposal.symbol || space.symbol, 'symbol') }}
          </span>
          <LoadingSpinner v-else />
          <BaseLink
            v-if="vp === 0 && vpLoaded && !vpLoading && !vpLoadingFailed"
            link="https://github.com/snapshot-labs/snapshot/discussions/767#discussioncomment-1400614"
            class="ml-1 flex items-center"
          >
            <BaseIcon name="info" size="24" class="text-skin-text" />
          </BaseLink>
        </div>
        <div
          v-if="Object.keys(props.proposal.plugins).includes('did')"
          class="flex"
        >
          <span class="mr-1 flex-auto text-skin-text">VC:</span>
          <select
            id="select"
            v-model="selectedVC"
            class="input w-full text-center"
          >
            <option
              v-for="vc in vcs"
              :key="vc.credentialSubject.id"
              :value="vc"
              class="vcOption"
            >
              {{ vc.credentialSubject.achievement }}
            </option>
          </select>
        </div>
        <div v-if="vpLoadingFailed" class="mt-3">{{ t('vpError') }}</div>
      </BaseBlock>
    </div>
    <template #footer>
      <div class="float-left w-2/4 pr-2">
        <BaseButton type="button" class="w-full" @click="$emit('close')">
          {{ $t('cancel') }}
        </BaseButton>
      </div>
      <div class="float-left w-2/4 pl-2">
        <BaseButton
          :disabled="
            vp === 0 ||
            clientLoading ||
            verifyingVP ||
            (Object.keys(props.proposal.plugins).includes('did') &&
              selectedVC === null)
          "
          :loading="clientLoading"
          type="submit"
          class="w-full"
          primary
          @click="handleSubmit"
        >
          {{ $t('proposal.vote') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.vcOption {
  background-color: #211f24;
  color: #fff;
}
</style>
