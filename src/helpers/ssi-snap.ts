export const SNAP_ID = 'npm:@blockchain-lab-um/ssi-snap';
const DOMAIN =
  'did:ethr:rinkeby:0x0241abd662da06d0af2f0152a80bc037f65a7f901160cfe1eb35ef3f0c532a2a4d';

type GetSnapsResponse = {
  [k: string]: {
    permissionName?: string;
    id?: string;
    version?: string;
    initialPermissions?: { [k: string]: unknown };
  };
};

const getWalletSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps'
  })) as GetSnapsResponse;
};

export const isSnapInstalled = async (
  snapOrigin: string,
  version?: string
): Promise<boolean> => {
  console.log(await getWalletSnaps());
  try {
    return !!Object.values(await getWalletSnaps()).find(
      permission =>
        permission.id === snapOrigin &&
        (!version || permission.version === version)
    );
  } catch (e) {
    console.log('Failed to obtain installed snaps', e);
    return false;
  }
};

export const installSnap = async () => {
  const res = await window.ethereum.request({
    method: 'wallet_enable',
    params: [
      {
        wallet_snap: { [SNAP_ID]: { version: 'latest' } }
      }
    ]
  });

  if (res) {
    const snap = res.snaps;
    //// TODO improve this
    if (snap[SNAP_ID]) {
      console.log('Sucessfuly installed.');
      return true;
    }
  }

  return false;
};

export const getVCs = async () => {
  try {
    const response = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: [
        SNAP_ID,
        {
          method: 'getVCs'
        }
      ]
    });
    console.log('response:');
    console.log(response);
    return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// FIXME: Need a better way to get specific VP
export const getVP = async (index: number) => {
  try {
    const res = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: [
        SNAP_ID,
        {
          method: 'getVP',
          params: [
            index,
            'did:ethr:rinkeby:0x0241abd662da06d0af2f0152a80bc037f65a7f901160cfe1eb35ef3f0c532a2a4d',
            'key123'
          ]
        }
      ]
    });

    return res.data;
  } catch (err) {
    return null;
  }
};
