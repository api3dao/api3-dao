import * as AragonConnect from '@aragon/connect-react'
import { 
  // Connect, 
  // useApps, 
  // usePermissions, 
  // Permission,
  // createAppHook, 
  // useApp,
} from '@aragon/connect-react'
// import connect from '@aragon/connect'
// import * as connectVoting from '@aragon/connect-voting'
import connect2 from "@aragon/connect"
import connectVoting from "@aragon/connect-voting"
// import tokens from "@aragon/connect-tokens"

export class Aragon {
  private constructor() {}

  private static _instance: Aragon;

  private async initialize() {
    try {
      
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
  
  public async log() {
    console.log('AragonConnect', AragonConnect)
    // console.log('Connect', Connect)
    // console.log('useApps', useApps)
    // console.log('Permission', Permission)
    const connect = AragonConnect.connect
    console.log('AragonConnect.connect', connect)
    console.log('connect2', connect2)
    // console.log('usePermissions', usePermissions)
    
    // console.log('tokens', tokens)
    const org = await connect('w3api.aragonid.eth', 'thegraph')
    console.log('org', org)
    // console.log('voting', voting)
    // const org = await connect('myorg.aragonid.eth', 'thegraph')
    const voting = await connectVoting(org.app('voting'))
    console.log("voting", voting)
    // console.log('connectVoting', connectVoting)
    // Connect the Voting app using the corresponding connector:
    // const voting = await connectVoting(org.app('voting'))

    // Fetch votes of the Voting app
    // const votes = await voting.votes()
  }
}

export default Aragon;
