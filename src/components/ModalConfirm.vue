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

const demoVP = {
  holder: 'did:ethr:0x4:0x451b2d7be6740584643bf06b2144555fb841a589',
  type: ['VerifiablePresentation', 'Custom'],
  verifiableCredential: [
    'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vYmV0YS5hcGkuc2NoZW1hcy5zZXJ0by5pZC92MS9wdWJsaWMvcHJvZ3JhbS1jb21wbGV0aW9uLWNlcnRpZmljYXRlLzEuMC9sZC1jb250ZXh0Lmpzb24iXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlByb2dyYW1Db21wbGV0aW9uQ2VydGlmaWNhdGUiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiYWNjb21wbGlzaG1lbnRUeXBlIjoiRGV2ZWxvcGVyIENlcnRpZmljYXRlIiwibmFtZSI6ImEiLCJhY2hpZXZlbWVudCI6IkNlcnRpZmllZCBTb2xpZGl0eSBEZXZlbG9wZXIgMiIsImNvdXJzZVByb3ZpZGVyIjoiVU0gRkVSSSJ9LCJjcmVkZW50aWFsU2NoZW1hIjp7ImlkIjoiaHR0cHM6Ly9iZXRhLmFwaS5zY2hlbWFzLnNlcnRvLmlkL3YxL3B1YmxpYy9wcm9ncmFtLWNvbXBsZXRpb24tY2VydGlmaWNhdGUvMS4wL2pzb24tc2NoZW1hLmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYVZhbGlkYXRvcjIwMTgifX0sInN1YiI6ImRpZDpldGhyOnJpbmtlYnk6MHg2QTI0Njg3NjIxY0REMUM3N0JiNmFDYkJFRTkxMGQwQzUxN2VCNDQzIiwibmJmIjoxNjUyNDQzNjkwLCJpc3MiOiJkaWQ6ZXRocjpyaW5rZWJ5OjB4MDI0MWFiZDY2MmRhMDZkMGFmMmYwMTUyYTgwYmMwMzdmNjVhN2Y5MDExNjBjZmUxZWIzNWVmM2YwYzUzMmEyYTRkIn0.Z4q7kn4vKdFI5QfAyQmqtWa0icAv91HqxSEwn-AMr4_bY3vfD_WeD3W9hgqf9tsUJPx2ru5gY3tLpAx04nk0RQ'
  ],
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  issuanceDate: '2022-06-21T07:43:27.907Z',
  proof: {
    verificationMethod:
      'did:ethr:0x4:0x451b2d7be6740584643bf06b2144555fb841a589#controller',
    created: '2022-06-21T07:43:27.907Z',
    proofPurpose: 'assertionMethod',
    type: 'EthereumEip712Signature2021',
    proofValue:
      '0x23c70a0de8e4e1996507c12f232e1fa1edd12bba7f4199af3e824d5fc54b97ea3dbbf4cf61921b474838e60575f24fb4a9da351d5434d788ad53d3d9615d5bb61c',
    eip712: {
      domain: {
        chainId: 4,
        name: 'VerifiablePresentation',
        version: '1'
      },
      messageSchema: {
        EIP712Domain: [
          {
            name: 'name',
            type: 'string'
          },
          {
            name: 'version',
            type: 'string'
          },
          {
            name: 'chainId',
            type: 'uint256'
          }
        ],
        Proof: [
          {
            name: 'created',
            type: 'string'
          },
          {
            name: 'proofPurpose',
            type: 'string'
          },
          {
            name: 'type',
            type: 'string'
          },
          {
            name: 'verificationMethod',
            type: 'string'
          }
        ],
        VerifiablePresentation: [
          {
            name: '@context',
            type: 'string[]'
          },
          {
            name: 'holder',
            type: 'string'
          },
          {
            name: 'issuanceDate',
            type: 'string'
          },
          {
            name: 'proof',
            type: 'Proof'
          },
          {
            name: 'type',
            type: 'string[]'
          },
          {
            name: 'verifiableCredential',
            type: 'string[]'
          }
        ]
      },
      primaryType: 'VerifiablePresentation'
    }
  }
};

const vcs = ref([]);
const selectedVC = ref(null);
const generatedVP = ref(null);

async function handleSubmit() {
  // const res = await window.ethereum.request({
  //   method: 'wallet_invokeSnap',
  //   params: [
  //     SNAP_ID,
  //     {
  //       method: 'getVP',
  //       params: [
  //         0,
  //         '',
  //         123
  //       ]
  //     }
  //   ]
  // });

  // console.log(res);
  // const vp = res.data;

  // FIXME
  const result = await send(props.space, 'vote', {
    proposal: props.proposal,
    choice: props.selectedChoices,
    vp: selectedVC.value
  });
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
      generatedVP.value = await getVP();

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
      vcs.value = await getVCs();
      if (selectedVC.value && generatedVP.value) {
        const response = await getPower(
          props.space,
          web3Account.value,
          props.proposal,
          selectedVC.value
        );
        vp.value = response.totalScore;
        vpByStrategy.value = response.scoresByStrategy;
      } else {
        vp.value = 0;
      }
    } catch (e) {
      vpLoadingFailed.value = true;
      console.log(e);
    } finally {
      vpLoaded.value = true;
      vpLoading.value = false;
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
        <div class="flex">
          <span class="mr-1 flex-auto text-skin-text">VP:</span>
          <select
            id="select"
            v-model="selectedVC"
            class="input w-full text-center"
          >
            <option
              v-for="vc in vcs"
              :key="vc.credentialSubject.id"
              :value="vc"
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
          :disabled="vp === 0 || clientLoading || selectedVC === null"
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
