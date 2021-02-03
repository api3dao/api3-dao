import BN from "bn.js";
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
  token: any;
  pool: any;
  signer: any;
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
      this.signer = await this.web3.getSigner()
      const token = await this.web3.getContract(API3Token, API3TokenABI);
      const pool = await this.web3.getContract(API3Pool, API3PoolABI);
      this.token = await token.connect(this.signer)
      this.pool = await pool.connect(this.signer)
      console.log(this.token);
      console.log(this.pool);
    } catch (error) {
      console.log('Error instanciating API3 Class', error)
    }
  }
  
  private async setAllowance(amount: number) {
    try {
      // const balance = 100000000
      amount = new BN(amount.toString())
      await this.token.approve(API3Pool, amount.toString());
    } catch (error) {
      console.log("error setting Allowance")
    }
  }
  
  public async print() {
    const address = await this.web3.getDefaultAddress();
    const API3TokenContract = await this.web3.getContract(API3Token, API3TokenABI);
    const API3PoolContract = await this.web3.getContract(API3Pool, API3PoolABI);
    console.log('API3PoolContract', API3PoolContract);
    console.log('API3TokenContract', API3TokenContract);
    const totalSupply = await this.token.totalSupply();
    console.log('totalSupply', totalSupply);
    let users = await this.pool.users(address);
    console.log("users", users);
    console.log("users.unstaked", users.unstaked);
    users = users.map((user: any) => {
      console.log('user', user);
      return user;
    });
    // console.log(await this.pool.totalStaked(2))
    // const balance = await API3PoolContract.balanceOfAt(7, "0x44A814f80c14977481b47C613CD020df6ea3D25D")
    // console.log("balance", balance)
  }

  public async deposit(amount: number) {
    try {
      const address = await this.web3.getDefaultAddress();
      const balance = await this.token.balanceOf(address);
      const allowance = await this.token.allowance(address, API3Pool);
      // If allowance === 0 means we need to ask for approval
      if(Number(allowance._hex) === 0) {
        // alert("API3Pool need your approval")
        console.log('allowance', allowance)
        console.log('balance', balance);
        await this.setAllowance(balance);
        const amountBN = new BN(amount);
        const exponent = new BN((1e18).toString());
        const depositAmount = new BN(amountBN.mul(exponent));
        const deposit = await this.pool.deposit(address, depositAmount.toString(), address)
        console.log("after allowance approval deposit", deposit)
      } else {
        const amountBN = new BN(amount);
        const exponent = new BN((1e18).toString());
        const depositAmount = new BN(amountBN.mul(exponent));
        const deposit = await this.pool.deposit(address, depositAmount.toString(), address)
        console.log("deposit", deposit)
      }
    } catch (error) {
      console.log('error in deposit', error);
    }
  }
  
  public async withdrawal(amount: number){
    try {
      const address = await this.web3.getDefaultAddress();
      const balance = await this.token.balanceOf(address);
      const allowance = await this.token.allowance(address, API3Pool);
      // If allowance === 0 means we need to ask for approval
      if(Number(allowance._hex) === 0) {
        alert("API3Pools need your approval")
        // console.log('allowance', allowance)
        // console.log('balance', balance);
        this.setAllowance(balance);
      } else {
        const amountBN = new BN(amount);
        const exponent = new BN((1e18).toString());
        const withdrawAmount = new BN(amountBN.mul(exponent));
        const withdraw = await this.pool.withdraw(address, withdrawAmount.toString())
        console.log("withdraw", withdraw);
      }
    } catch (error) {
      console.log('error in withdraw', error);
    }
  }
  
  public async stake(amount: number){
    try {
      const address = await this.web3.getDefaultAddress();
      const balance = await this.token.balanceOf(address);
      const allowance = await this.token.allowance(address, API3Pool);
      // If allowance === 0 means we need to ask for approval
      if(Number(allowance._hex) === 0) {
        alert("API3Pools need your approval")
        // console.log('allowance', allowance)
        // console.log('balance', balance);
        this.setAllowance(balance);
      } else {
        const amountBN = new BN(amount);
        const exponent = new BN((1e18).toString());
        const stakeAmount = new BN(amountBN.mul(exponent));
        const stake = await this.pool.stake(stakeAmount.toString())
        console.log("stake", stake);
      }
    } catch (error) {
      console.log('error in stake', error);
    }
  }
  
  public async unstake() {
    try {
      const address = await this.web3.getDefaultAddress();
      const balance = await this.token.balanceOf(address);
      const allowance = await this.token.allowance(address, API3Pool);
      // If allowance === 0 means we need to ask for approval
      if(Number(allowance._hex) === 0) {
        alert("API3Pools need your approval")
        // console.log('allowance', allowance)
        // console.log('balance', balance);
        this.setAllowance(balance);
      } else {
        // const amountBN = new BN(amount);
        // const exponent = new BN((1e18).toString());
        // const unstakeAmount = new BN(amountBN.mul(exponent));
        const unstake = await this.pool.unstake()
        console.log("unstake", unstake);
      }
    } catch (error) {
      console.log('error in unstake', error);
    }
  }
  
  public async scheduleUnstake(amount: number) {
    try {
      const address = await this.web3.getDefaultAddress();
      const balance = await this.token.balanceOf(address);
      const allowance = await this.token.allowance(address, API3Pool);
      // If allowance === 0 means we need to ask for approval
      if(Number(allowance._hex) === 0) {
        alert("API3Pools need your approval");
        // console.log('allowance', allowance)
        // console.log('balance', balance);
        this.setAllowance(balance);
      } else {
        const amountBN = new BN(amount);
        const exponent = new BN((1e18).toString());
        const scheduleUnstakeAmount = new BN(amountBN.mul(exponent));
        const scheduleUnstake = await this.pool.scheduleUnstake(scheduleUnstakeAmount.toString());
        console.log("scheduleUnstake", scheduleUnstake);
      }
    } catch (error) {
      console.log('error in scheduleUnstake', error);
    }
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
