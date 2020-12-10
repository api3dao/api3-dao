import connect from '@aragon/connect'
import connectVoting from "@aragon/connect-voting"

import { ARAGON_APPS_ADDRESS } from "services/constants"
import { Web3 } from "services/web3";
import { IWeb3Provider, Signer } from "services/web3/types";
import { Organization } from 'services/aragon/types';

export class Aragon {
  web3: IWeb3Provider
  org: Organization
  signer: Signer | undefined;
  address: string | undefined;
  private constructor() {}

  private static _instance: Aragon;
  
  private async initialize() {
    try {
      this.org = await connect('api3dao.aragonid.eth', 'thegraph', { network: 4 });
      this.web3 = await Web3.getInstance();
      this.signer = await this.web3.getSigner();
      this.address = await this.web3.getDefaultAddress();
    } catch (error) {
      console.log('Error instanciating Aragon Class', error)
    }
  }
  
  public static async getInstance() {
    if (!this._instance) {
      const instance = new Aragon();
      await instance.initialize();
      this._instance = instance;
    }
    return this._instance;
  }
  
  public async votes() {
    const voting = await connectVoting(this.org.app('voting'));
    // Fetch votes of the Voting app.
    const votes = await voting.votes();
    return votes
  }
  
  public async newVote(stakingTarget?: number) {
    const voteProposal = {
      stakingTarget,
      metadata: "refactor new vote",
      // executionScript: Buffer.from('0x00000001'),
      executionScript: '0x00000001',
      castVote: false,
      executesIfDecided: false,
    }
    const { 
      metadata, 
      executionScript, 
      // castVote, 
      // executesIfDecided 
    } = voteProposal;
    
    const newVoteParams = [
      executionScript, 
      metadata,
      // castVote, 
      // executesIfDecided
    ];
    
    const intent = this.org.appIntent(
      ARAGON_APPS_ADDRESS.voting, 
      'newVote',
      newVoteParams,
    );
    console.log('intent', intent);
    const path = await intent.paths(this.address);
    console.log('path', path)
    const { transactions } = path;
    const executeTx = async (tx: any, index: number) => {
      const { from, to, data } = tx;
      if(index === 0) {
        console.log('tx index 0', tx);
        tx = {
          from, to, data 
        }
        const sign = await this.signer?.sendTransaction(tx);
        console.log('sign', sign)
      }
      if(index === 1) {
        // no need to do anything/sign it with this 2nd tx
        console.log('tx index 1', tx);
        // const sign = await signer?.sendTransaction(tx);
      }
    }
    transactions.map(executeTx);
  }

  public async vote(voteID?: string) {
    const voting = await connectVoting(this.org.app('voting'));
    // console.log('voting', voting);
    // Fetch votes of the Voting app.
    const votes = await voting.votes();
    console.log('votes', votes);
    // TODO Extract VoteID from aragon votes array.
    // Need to select the corresponding vote versus the last.
    // This will be done thru UI.
    // From UI we will pass the ID of the Vote/Vote Proposal.
    const vote = votes[votes.length - 1];
    voteID = vote.id;
    // get index of vote.
    let voteIndex: number = 0;
    votes.filter((vote, index) => {
      if(vote.id === voteID) {
        console.log('index', index);
        voteIndex = index
      }
      return vote.id === voteID;
    });

    const intent = this.org.appIntent(ARAGON_APPS_ADDRESS.voting, 'vote', [voteIndex, true, false]);
    const path = await intent.paths(this.address);
    const { transactions } = path;
    const latestTx = transactions[0];
    const { from, to, data } = latestTx;
    let signTx = {
      from,
      to,
      data,
    }
    // Users sign Vote TxRequest.
    const sign = await this.signer?.sendTransaction(signTx);
    return sign;
  }
}

export default Aragon;
