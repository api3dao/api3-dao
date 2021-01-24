import { Web3 } from "services/web3";
import { IWeb3Provider } from "services/web3/types";
import { API3TokenABI, API3PoolABI } from "services/api3/abis";
import { API3ContractAddresses } from "services/api3/addresses";

// API3 services to make API3 contract functions calls.
// actions.
//  Deposit to API3 contract to able to stake API3.
//  Stake API3 tokens after deposit.
//  Withdrawal after staking
//  Unstake after cooldown
//  Delegates user tokens/vote weight/power to another address.
//  Undelegate weight power & tokens.
//  Vote
//  Unvote/Change Vote
//  Slideshow that shows tips of how to use the ui/app.
//  Fetch Insurance pool information for Landing
//  Cooldown Ends and it will enable users to unstake.

const { API3Pool, API3Token } = API3ContractAddresses;
// console.log('TokenContractAddresses', TokenContractAddresses.API3Token)
export class API3 {
  web3: IWeb3Provider
  static _instance: API3
  
  public static async getInstance() {
    if (!this._instance) {
      const instance = new API3();
      await instance.init();
      this._instance = instance;
    }
    return this._instance;
  }
  
  private async init() {
    try {
      this.web3 = await Web3.getInstance();
    } catch (error) {
      console.log('Error instanciating API3 Class', error)
    }
  }
  
  public async print() {
    const API3TokenContract = await this.web3.getContract(API3Token, API3TokenABI);
    const API3PoolContract = await this.web3.getContract(API3Pool, API3PoolABI);
    console.log('API3PoolContract', API3PoolContract);
    console.log('API3TokenContract', API3TokenContract);
    
  }
  
  public async deposit(){
    
  }
  
  public async withdrawal(){
    
  }
  
  public async stake(){
    
  }
  
  public async unstake(){
    
  }
  
  public async delegate(delegator: string, power: number) {
    
  }
  
  public async undelegate(delegator: string, power: number) {
    
  }
  
  public async vote(){
    
  }
  
  public async unvote(){
    
  }
  
  public async insurancePool() {
    
  }

}

export default API3;
