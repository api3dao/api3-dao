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
  network: number | string | undefined;
  private constructor() {}

  private static _instance: Aragon;
  
  private async initialize() {
    try {
      this.web3 = await Web3.getInstance();
      this.signer = await this.web3.getSigner();
      this.address = await this.web3.getDefaultAddress();
      // This will be extracted from web3 getNetwork function.
      this.network = 4
      this.org = await connect('api3dao.aragonid.eth', 'thegraph', { network: this.network });
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
    let votes = await voting.votes();
    const compare = (a: any, b: any) => {
      const date1 = new Date(a.startDate * 1000);
      const date2 = new Date(b.startDate * 1000);
      let comparison = 0;
      if (date1 < date2) {
        comparison = 1;
      } else {
        comparison = -1;
      }
      return comparison;
    }
    return votes.sort(compare)
  }
  
  public async newVote(stakingTarget?: number, description?: string, callback?: Function | any) {
    description = description ?  description : "no description was provided"
    const voteProposal = {
      stakingTarget,
      metadata: description,
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
      ARAGON_APPS_ADDRESS.rinkeby.voting, 
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
        try {
          const sign = await this.signer?.sendTransaction(tx);
          callback()
        } catch (error) {
          console.log('Popup error message callback')
        }
      }
      if(index === 1) {
        // no need to do anything/sign it with this 2nd tx
        console.log('tx index 1', tx);
        // const sign = await signer?.sendTransaction(tx);
      }
    }
    transactions.map(executeTx);
  }

  public async vote(voteID: number, favor: boolean) {    
    const intent = this.org.appIntent(ARAGON_APPS_ADDRESS.rinkeby.voting, 'vote', [voteID, favor, false]);
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
