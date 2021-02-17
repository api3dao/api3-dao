import connect from "@aragon/connect"
import connectVoting from "@aragon/connect-voting"
import connectFinance from "@aragon/connect-finance"

import { Web3 } from "services/web3";
import { IWeb3Provider, Signer } from "services/web3/types";
import { Organization } from "services/aragon/types";

export class Aragon {
  web3: IWeb3Provider
  signer: Signer | undefined;
  address: string | undefined;
  network: number | string | undefined;
  intent: any;
  voting: any;
  finance: any;
  tokens: any;
  org: Organization

  public async init() {
    try {
      this.web3 = await Web3.getInstance();
      this.signer = await this.web3.getSigner();
      this.address = await this.web3.getDefaultAddress();
      // This will be extracted from web3 getNetwork function.
      this.network = 4
      this.org = await connect('api3dao.aragonid.eth', 'thegraph', { network: this.network });
      // For the future we will replace thegraph with an ethereum node
      // this.org = await connect('api3dao.aragonid.eth', 'ethereum', { network: this.network, ethereum: this.web3.provider });
      this.voting = await connectVoting(this.org.app('voting'));
      this.finance = await connectFinance(this.org.app('finance'));
      console.log('this.finance', this.finance);
    } catch (error) {
      console.log('Error instanciating Aragon Class', error)
    }
  }

}

export default Aragon;
