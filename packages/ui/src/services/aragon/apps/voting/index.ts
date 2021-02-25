import { Aragon } from "services/aragon";
import { ARAGON_APPS_ADDRESS } from "services/constants"

export class Voting extends Aragon {
  private constructor() {
    super();
  }

  private static _instance: Voting;
  
  private async initialize() {
    try {
      await this.init()
    } catch (error) {
      console.log('Error instanciating Voting Class', error)
    }
  }
  
  public static async getInstance() {
    if (!this._instance) {
      const instance = new Voting();
      await instance.initialize();
      this._instance = instance;
    }
    return this._instance;
  }
  
  public async votes() {
    const votes = await this.voting.votes();
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
    votes.sort(compare)
    return votes;
  }
  
  public async voteById(id: number) {
    const votes = await this.votes();
    return votes.reverse()[id];
  }
  
  public async newVote(description?: string, callback?: Function | any) {
    description = description ?  description : "no description was provided";
    
    const voteProposal = {
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
          console.log('NewVote sign', sign);
          callback()
        } catch (error) {
          console.log('Popup error message callback error:', error);
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

export default Voting;