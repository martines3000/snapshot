import voting from '@snapshot-labs/snapshot.js/src/voting';
import { apolloClient } from '@/helpers/apollo';
import { PROPOSAL_QUERY, VOTES_QUERY } from '@/helpers/queries';
import cloneDeep from 'lodash/cloneDeep';
import { getScores } from '@snapshot-labs/snapshot.js/src/utils';

export async function getProposalVotes(
  proposalId: string,
  { first, voter, skip }: any = { first: 30000, voter: '', skip: 0 }
) {
  try {
    console.time('getProposalVotes');
    const response = await apolloClient.query({
      query: VOTES_QUERY,
      variables: {
        id: proposalId,
        orderBy: 'vp',
        orderDirection: 'desc',
        first,
        voter,
        skip
      }
    });
    console.timeEnd('getProposalVotes');
    const votesResClone = cloneDeep(response);
    return votesResClone.data.votes;
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getProposal(id) {
  try {
    console.time('getProposal');
    const response = await apolloClient.query({
      query: PROPOSAL_QUERY,
      variables: {
        id
      }
    });
    console.timeEnd('getProposal');

    const proposalResClone = cloneDeep(response);
    const proposal = proposalResClone.data.proposal;

    if (proposal?.plugins?.daoModule) {
      // The Dao Module has been renamed to SafeSnap
      // Previous proposals have to be renamed
      proposal.plugins.safeSnap = proposal.plugins.daoModule;
      delete proposal.plugins.daoModule;
    }

    return proposal;
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getResults(space, proposal, votes) {
  console.log('[score] getResults');
  console.log(votes);
  const voters = votes.map(vote => vote.voter);
  const vps = votes.map(vote => vote.metadata.vp);
  const strategies = proposal.strategies ?? space.strategies;

  /* Get scores */
  if (proposal.state !== 'pending') {
    console.time('getProposal.scores');
    let scores;

    // DID PLUGIN
    if (Object.keys(proposal.plugins).includes('did')) {
      scores = await getScoresDID(
        space.id,
        strategies,
        proposal.network,
        voters,
        vps,
        proposal.plugins.did.issuer,
        parseInt(proposal.snapshot),
        import.meta.env.VITE_SCORES_URL + '/api/scores'
      );
    } else {
      scores = await getScores(
        space.id,
        strategies,
        proposal.network,
        voters,
        parseInt(proposal.snapshot),
        import.meta.env.VITE_SCORES_URL + '/api/scores'
      );
    }

    console.timeEnd('getProposal.scores');
    console.log('Got scores');

    votes = votes
      .map((vote: any) => {
        vote.scores = strategies.map((strategy, i) => {
          return scores[i] && scores[i][vote.voter] ? scores[i][vote.voter] : 0;
        });
        vote.balance = vote.scores.reduce((a, b: any) => a + b, 0);
        return vote;
      })
      .sort((a, b) => b.balance - a.balance)
      .filter(vote => vote.balance > 0);
  }

  /* Get results */
  const votingClass = new voting[proposal.type](proposal, votes, strategies);
  const results = {
    scores: votingClass.getScores(),
    scoresByStrategy: votingClass.getScoresByStrategy(),
    scoresTotal: votingClass.getScoresTotal()
  };

  return { votes, results };
}

export async function getPower(space, address, proposal, vp = null) {
  console.log('[score] getPower');
  const strategies = proposal.strategies ?? space.strategies;

  let scores;

  // DID PLUGIN
  if (Object.keys(proposal.plugins).includes('did')) {
    scores = await getScoresDID(
      space.id,
      strategies,
      proposal.network,
      [address],
      [vp],
      proposal.plugins.did.issuer,
      parseInt(proposal.snapshot),
      import.meta.env.VITE_SCORES_URL + '/api/scores'
    );
  } else {
    scores = await getScores(
      space.id,
      strategies,
      proposal.network,
      [address],
      parseInt(proposal.snapshot),
      import.meta.env.VITE_SCORES_URL + '/api/scores'
    );
  }

  console.log('scores:');
  console.log(scores);

  const scoresByStrategy = strategies.map((strategy, i) => {
    return scores[i] && scores[i][address] ? scores[i][address] : 0;
  });

  return {
    scoresByStrategy,
    totalScore: scoresByStrategy.reduce((a, b: any) => a + b, 0)
  };
}

export async function getScoresDID(
  space: string,
  strategies: any[],
  network: string,
  addresses: string[],
  vps: any[],
  issuer: string,
  snapshot: number | string = 'latest',
  scoreApiUrl = 'https://score.snapshot.org/api/scores'
) {
  try {
    const params = {
      space,
      network,
      snapshot,
      strategies,
      addresses,
      vps,
      issuer
    };

    const res = await fetch(scoreApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params })
    });
    const obj = await res.json();
    return obj.result.scores;
  } catch (e) {
    return Promise.reject(e);
  }
}
