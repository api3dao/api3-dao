/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { StateUtils } from "../StateUtils";

export class StateUtils__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(api3TokenAddress: string, overrides?: Overrides): Promise<StateUtils> {
    return super.deploy(
      api3TokenAddress,
      overrides || {}
    ) as Promise<StateUtils>;
  }
  getDeployTransaction(
    api3TokenAddress: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(api3TokenAddress, overrides || {});
  }
  attach(address: string): StateUtils {
    return super.attach(address) as StateUtils;
  }
  connect(signer: Signer): StateUtils__factory {
    return super.connect(signer) as StateUtils__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StateUtils {
    return new Contract(address, _abi, signerOrProvider) as StateUtils;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "api3TokenAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fromBlock",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "balanceOfAt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "claimPayoutReferenceBlocks",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "claimPayouts",
    outputs: [
      {
        internalType: "uint256",
        name: "fromBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "claimReleaseReferenceBlocks",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "claimReleases",
    outputs: [
      {
        internalType: "uint256",
        name: "fromBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentApr",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "locks",
    outputs: [
      {
        internalType: "uint256",
        name: "fromBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxApr",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minApr",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "rewardAmounts",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "rewardBlocks",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardEpochLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "rewardPaidForEpoch",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "rewardReleases",
    outputs: [
      {
        internalType: "uint256",
        name: "fromBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardVestingPeriod",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stakeTarget",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "totalShares",
    outputs: [
      {
        internalType: "uint256",
        name: "fromBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "totalStaked",
    outputs: [
      {
        internalType: "uint256",
        name: "fromBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "fromBlock",
        type: "uint256",
      },
    ],
    name: "updateAndGetBalanceOfAt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "updateCoeff",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "targetBlock",
        type: "uint256",
      },
    ],
    name: "updateUserState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "users",
    outputs: [
      {
        internalType: "uint256",
        name: "unstaked",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "locked",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastStateUpdateTargetBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "unstakeScheduledAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "unstakeAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60c0604052622503f660809081525062093a8060a090815250622625a0600a5563047868c0600b556a084595161401484a000000600c55620f4240600d55600a5460115534801561004f57600080fd5b506040516119af3803806119af8339818101604052602081101561007257600080fd5b8101908080519060200190929190505050600260405180604001604052804381526020016001815250908060018154018082558091505060019003906000526020600020906002020160009091909190915060008201518160000155602082015181600101555050600360405180604001604052804381526020016001815250908060018154018082558091505060019003906000526020600020906002020160009091909190915060008201518160000155602082015181600101555050806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060805160a0516118066101a96000398061075f52806107a75280611297525080610de8528061107f528061150452506118066000f3fe608060405234801561001057600080fd5b50600436106101415760003560e01c806358780938116100b8578063ca0930471161007c578063ca0930471461050a578063de5ba6dc1461054c578063decac4f51461058e578063ee677b36146105ac578063eebb19801461060e578063f4dadc611461065757610141565b806358780938146103d657806362bc785514610418578063784b3c5d1461045a57806392093b3614610478578063a87430ba1461049657610141565b80632dd5090c1161010a5780632dd5090c146102765780632eebce2c146102ba57806339a288bd1461030857806341cb8c20146103515780634eb05c471461039a5780634f322ae8146103b857610141565b806201e8621461014657806305be8a8c146101a857806310664413146101f157806313f2dad01461020f57806320a0a0e914610258575b600080fd5b6101926004803603604081101561015c57600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506106a0565b6040518082815260200191505060405180910390f35b6101d4600480360360208110156101be57600080fd5b81019080803590602001909291905050506106f5565b604051808381526020018281526020019250505060405180910390f35b6101f9610726565b6040518082815260200191505060405180910390f35b61023b6004803603602081101561022557600080fd5b810190808035906020019092919050505061072c565b604051808381526020018281526020019250505060405180910390f35b61026061075d565b6040518082815260200191505060405180910390f35b6102a26004803603602081101561028c57600080fd5b8101908080359060200190929190505050610781565b60405180821515815260200191505060405180910390f35b610306600480360360408110156102d057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506107a1565b005b6103346004803603602081101561031e57600080fd5b8101908080359060200190929190505050610f5b565b604051808381526020018281526020019250505060405180910390f35b61037d6004803603602081101561036757600080fd5b8101908080359060200190929190505050610f8c565b604051808381526020018281526020019250505060405180910390f35b6103a2610fbd565b6040518082815260200191505060405180910390f35b6103c0610fc3565b6040518082815260200191505060405180910390f35b610402600480360360208110156103ec57600080fd5b8101908080359060200190929190505050610fc9565b6040518082815260200191505060405180910390f35b6104446004803603602081101561042e57600080fd5b8101908080359060200190929190505050610fea565b6040518082815260200191505060405180910390f35b610462611002565b6040518082815260200191505060405180910390f35b610480611008565b6040518082815260200191505060405180910390f35b6104d8600480360360208110156104ac57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061100e565b604051808681526020018581526020018481526020018381526020018281526020019550505050505060405180910390f35b6105366004803603602081101561052057600080fd5b8101908080359060200190929190505050611044565b6040518082815260200191505060405180910390f35b6105786004803603602081101561056257600080fd5b810190808035906020019092919050505061105c565b6040518082815260200191505060405180910390f35b61059661107d565b6040518082815260200191505060405180910390f35b6105f8600480360360408110156105c257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506110a1565b6040518082815260200191505060405180910390f35b61063a6004803603602081101561062457600080fd5b8101908080359060200190929190505050611100565b604051808381526020018281526020019250505060405180910390f35b6106836004803603602081101561066d57600080fd5b8101908080359060200190929190505050611131565b604051808381526020018281526020019250505060405180910390f35b60006106ed600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010184611162565b905092915050565b6004818154811061070257fe5b90600052602060002090600202016000915090508060000154908060010154905082565b600d5481565b6002818154811061073957fe5b90600052602060002090600202016000915090508060000154908060010154905082565b7f000000000000000000000000000000000000000000000000000000000000000081565b600e6020528060005260406000206000915054906101000a900460ff1681565b600e60007f000000000000000000000000000000000000000000000000000000000000000042816107ce57fe5b04815260200190815260200160002060009054906101000a900460ff166107f8576107f761128b565b5b6000610845600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010143611162565b90506000600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206002015490506000600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060030154905060008114156108e357600190505b600060046000815481106108f357fe5b906000526020600020906002020160000154600183031061092457600161091e60046001850361161c565b01610927565b60005b90505b6004805490508110801561095b5750846004828154811061094757fe5b906000526020600020906002020160000154105b15610b095760006004828154811061096f57fe5b90600052602060002090600202016000015490506000610990600383611162565b9050600061099f600284611162565b905060008282600487815481106109b257fe5b90600052602060002090600202016001015402816109cc57fe5b0490506000600586815481106109de57fe5b9060005260206000200154905060006109f8600283611162565b90506000610a47600160008f73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010184611162565b905060008282860281610a5657fe5b049050808c039b50600160008f73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160405180604001604052808a81526020018e8152509080600181540180825580915050600190039060005260206000209060020201600090919091909150600082015181600001556020820151816001015550505050505050505050808060010191505061092a565b5060006006600081548110610b1a57fe5b9060005260206000209060020201600001546001830310610b4b576001610b4560066001850361161c565b01610b4e565b60005b90505b60068054905081108015610b8257508460068281548110610b6e57fe5b906000526020600020906002020160000154105b15610c3057600060068281548110610b9657fe5b906000526020600020906002020190506000610bb760028360000154611162565b90506000610c0a600160008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206001018460000154611162565b9050818184600101540281610c1b57fe5b04860195505050508080600101915050610b51565b5060006008600081548110610c4157fe5b9060005260206000209060020201600001546001830310610c72576001610c6c60086001850361161c565b01610c75565b60005b90505b60088054905081108015610ca957508460088281548110610c9557fe5b906000526020600020906002020160000154105b15610d6657600060098281548110610cbd57fe5b906000526020600020015490506000610cd7600283611162565b90506000610d26600160008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010184611162565b9050818160088681548110610d3757fe5b9060005260206000209060020201600101540281610d5157fe5b04860395505050508080600101915050610c78565b5060006007600081548110610d7757fe5b9060005260206000209060020201600001546001830310610da8576001610da260076001850361161c565b01610dab565b60005b90505b60078054905081108015610ddf57508460078281548110610dcb57fe5b906000526020600020906002020160000154105b15610ec55760007f000000000000000000000000000000000000000000000000000000000000000060078381548110610e1457fe5b9060005260206000209060020201600001540390506000610e36600283611162565b90506000610e85600160008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010184611162565b9050818160078681548110610e9657fe5b9060005260206000209060020201600101540281610eb057fe5b04860395505050508080600101915050610dae565b5081600160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206002018190555083600160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600301819055505050505050565b60078181548110610f6857fe5b90600052602060002090600202016000915090508060000154908060010154905082565b60038181548110610f9957fe5b90600052602060002090600202016000915090508060000154908060010154905082565b600c5481565b60115481565b60098181548110610fd657fe5b906000526020600020016000915090505481565b60106020528060005260406000206000915090505481565b600a5481565b600b5481565b60016020528060005260406000206000915090508060000154908060020154908060030154908060040154908060050154905085565b600f6020528060005260406000206000915090505481565b6005818154811061106957fe5b906000526020600020016000915090505481565b7f000000000000000000000000000000000000000000000000000000000000000081565b60006110ad83836107a1565b6110f8600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010183611162565b905092915050565b6008818154811061110d57fe5b90600052602060002090600202016000915090508060000154908060010154905082565b6006818154811061113e57fe5b90600052602060002090600202016000915090508060000154908060010154905082565b600080838054905014156111795760009050611285565b8260018480549050038154811061118c57fe5b90600052602060002090600202016000015482106111d057826001848054905003815481106111b757fe5b9060005260206000209060020201600101549050611285565b826000815481106111dd57fe5b9060005260206000209060020201600001548210156111ff5760009050611285565b600080600185805490500390505b8181111561126257600060026001848401018161122657fe5b0490508486828154811061123657fe5b906000526020600020906002020160000154116112555780925061125c565b6001810391505b5061120d565b84828154811061126e57fe5b906000526020600020906002020160010154925050505b92915050565b6112936116c7565b60007f000000000000000000000000000000000000000000000000000000000000000042816112be57fe5b04905060006003600160038054905003815481106112d857fe5b906000526020600020906002020160010154905060006305f5e100603460115484028161130157fe5b048161130957fe5b0490506001600e600085815260200190815260200160002060006101000a81548160ff02191690831515021790555043601060008581526020019081526020016000208190555060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663bbb30c5d306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156113d757600080fd5b505afa1580156113eb573d6000803e3d6000fd5b505050506040513d602081101561140157600080fd5b810190808051906020019092919050505061141e5750505061161a565b600081141561142f5750505061161a565b80600f600085815260200190815260200160002081905550600360405180604001604052804381526020018385018152509080600181540180825580915050600190039060005260206000209060020201600090919091909150600082015181600001556020820151816001015550506006604051806040016040528043815260200183815250908060018154018082558091505060019003906000526020600020906002020160009091909190915060008201518160000155602082015181600101555050600760405180604001604052807f0000000000000000000000000000000000000000000000000000000000000000430181526020018381525090806001815401808255809150506001900390600052602060002090600202016000909190919091506000820151816000015560208201518160010155505060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166340c10f1930836040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050600060405180830381600087803b1580156115fe57600080fd5b505af1158015611612573d6000803e3d6000fd5b505050505050505b565b60008260018480549050038154811061163157fe5b906000526020600020906002020160000154821061165857600183805490500390506116c1565b600080600185805490500390505b818111156116bb57600060026001848401018161167f57fe5b0490508486828154811061168f57fe5b906000526020600020906002020160000154116116ae578092506116b5565b6001810391505b50611666565b81925050505b92915050565b6000600c5414156116e057600a546011819055506117ce565b60006003600160038054905003815481106116f757fe5b90600052602060002090600202016001015490506000600c54821061172057600c548203611726565b81600c54035b90506000600c546305f5e10083028161173b57fe5b0490506000620f4240600d5483028161175057fe5b049050600c548410611779576305f5e100816305f5e10003601154028161177357fe5b04611792565b6305f5e100816305f5e10001601154028161179057fe5b045b601181905550600a5460115410156117b257600a546011819055506117c9565b600b5460115411156117c857600b546011819055505b5b505050505b56fea2646970667358221220cbd85c66c454321505e9aa69128ffebb0d4dde438324c9f4b0da180d994d401364736f6c634300060c0033";
