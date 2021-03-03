/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { GetterUtils } from "../GetterUtils";

export class GetterUtils__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    api3TokenAddress: string,
    overrides?: Overrides
  ): Promise<GetterUtils> {
    return super.deploy(
      api3TokenAddress,
      overrides || {}
    ) as Promise<GetterUtils>;
  }
  getDeployTransaction(
    api3TokenAddress: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(api3TokenAddress, overrides || {});
  }
  attach(address: string): GetterUtils {
    return super.attach(address) as GetterUtils;
  }
  connect(signer: Signer): GetterUtils__factory {
    return super.connect(signer) as GetterUtils__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GetterUtils {
    return new Contract(address, _abi, signerOrProvider) as GetterUtils;
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "delegate",
        type: "address",
      },
    ],
    name: "Delegated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newApr",
        type: "uint256",
      },
    ],
    name: "Epoch",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "delegate",
        type: "address",
      },
    ],
    name: "Undelegated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "toEpoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "locked",
        type: "uint256",
      },
    ],
    name: "UserUpdate",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "balanceOf",
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
    inputs: [],
    name: "claimsManager",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
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
        internalType: "address",
        name: "delegate",
        type: "address",
      },
    ],
    name: "delegateShares",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "delegatedTo",
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
        name: "fromBlock",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "delegatedToAt",
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
    name: "genesisEpoch",
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
    ],
    name: "getUserLocked",
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
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "targetEpoch",
        type: "uint256",
      },
    ],
    name: "getUserLockedAt",
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
    name: "lastEpochPaid",
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
        name: "targetEpoch",
        type: "uint256",
      },
    ],
    name: "payReward",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "rewards",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "atBlock",
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
    ],
    name: "shares",
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
        name: "fromBlock",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "sharesAt",
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
    inputs: [],
    name: "totalStake",
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
        name: "fromBlock",
        type: "uint256",
      },
    ],
    name: "totalStakeAt",
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
    inputs: [],
    name: "totalSupply",
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
        name: "fromBlock",
        type: "uint256",
      },
    ],
    name: "totalSupplyAt",
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
    name: "undelegateShares",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unstakeWaitPeriod",
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
        name: "targetEpoch",
        type: "uint256",
      },
    ],
    name: "updateUserLocked",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "userDelegating",
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
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_block",
        type: "uint256",
      },
    ],
    name: "userDelegatingAt",
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
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "userStaked",
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
        name: "vesting",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "delegating",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "unstakeScheduledFor",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "unstakeAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastUpdateEpoch",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "oldestLockedEpoch",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60a0604052622625a060065563047868c06007556a084595161401484a000000600855620f424060095562093a80600a55600654600b553480156200004357600080fd5b5060405162001d3e38038062001d3e833981810160405260208110156200006957600080fd5b50516040805180820182524380825260016020808401828152600280548085018255600082815296517f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace9183029182015591517f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5acf909201919091558551808701909652928552848101828152600380549384018155855294517fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b929093029182019290925592517fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85c9093019290925580546001600160a01b0319166001600160a01b038416179055819081906200019090429062093a809062000213811b620012b917901c565b608052620001ae4262093a8062000213602090811b620012b917901c565b6005819055506040518060400160405280600081526020014381525060046000620001eb62093a80426200021360201b620012b91790919060201c565b815260208082019290925260400160002082518155910151600190910155506200030b915050565b60006200025d83836040518060400160405280601a81526020017f536166654d6174683a206469766973696f6e206279207a65726f0000000000008152506200026460201b60201c565b9392505050565b60008183620002f45760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b83811015620002b85781810151838201526020016200029e565b50505050905090810190601f168015620002e65780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5060008385816200030157fe5b0495945050505050565b608051611a096200033560003980610f2a52806111a1528061136c528061139b5250611a096000f3fe608060405234801561001057600080fd5b50600436106102055760003560e01c8063784b3c5d1161011a578063b70e6be6116100ad578063e14b5fac1161007c578063e14b5fac1461055b578063e7460a5214610581578063f301af4214610589578063f32ca51f146105a6578063fe667bad146105d257610205565b8063b70e6be6146104f9578063ce7c2ac214610501578063d7aa2b8014610527578063decac4f51461055357610205565b8063981b24d0116100e9578063981b24d014610423578063a30d842414610440578063a87430ba1461046c578063acc3a939146104d357610205565b8063784b3c5d146104035780638b0e9f3f1461040b578063917656b91461041357806392093b361461041b57610205565b806341cb8c201161019d57806350aa9f7b1161016c57806350aa9f7b1461033a57806365da12641461037457806368e86df71461039a57806370a08231146103c05780637702059e146103e657610205565b806341cb8c20146103055780634861f169146103225780634eb05c471461032a5780634f322ae81461033257610205565b806318dbf733116101d957806318dbf7331461028e5780631eb08ba9146102bc57806320a0a0e9146102e0578063276e0058146102e857610205565b806201e8621461020a578063106644131461024857806313f2dad01461025057806318160ddd14610286575b600080fd5b6102366004803603604081101561022057600080fd5b50803590602001356001600160a01b03166105fe565b60408051918252519081900360200190f35b610236610648565b61026d6004803603602081101561026657600080fd5b503561064e565b6040805192835260208301919091528051918290030190f35b610236610679565b6102ba600480360360408110156102a457600080fd5b506001600160a01b038135169060200135610689565b005b6102c461071b565b604080516001600160a01b039092168252519081900360200190f35b61023661072a565b610236600480360360208110156102fe57600080fd5b5035610731565b61026d6004803603602081101561031b57600080fd5b503561073e565b6102ba61074b565b6102366108c0565b6102366108c6565b6103606004803603602081101561035057600080fd5b50356001600160a01b03166108cc565b604080519115158252519081900360200190f35b6102366004803603602081101561038a57600080fd5b50356001600160a01b03166108d8565b6102ba600480360360208110156103b057600080fd5b50356001600160a01b03166108e4565b610236600480360360208110156103d657600080fd5b50356001600160a01b0316610b4c565b6102ba600480360360208110156103fc57600080fd5b5035610b58565b610236610e56565b610236610e5c565b610236610e67565b610236610e6d565b6102366004803603602081101561043957600080fd5b5035610e73565b6103606004803603604081101561045657600080fd5b506001600160a01b038135169060200135610e80565b6104926004803603602081101561048257600080fd5b50356001600160a01b0316610eba565b604080519889526020890197909752878701959095529215156060870152608086019190915260a085015260c084015260e083015251908190036101000190f35b610236600480360360208110156104e957600080fd5b50356001600160a01b0316610f01565b610236610f28565b6102366004803603602081101561051757600080fd5b50356001600160a01b0316610f4c565b6102366004803603604081101561053d57600080fd5b50803590602001356001600160a01b0316610f54565b610236610f80565b6102366004803603602081101561057157600080fd5b50356001600160a01b0316610f85565b610236610f9d565b61026d6004803603602081101561059f57600080fd5b5035610fa3565b610236600480360360408110156105bc57600080fd5b506001600160a01b038135169060200135610fbc565b610236600480360360408110156105e857600080fd5b50803590602001356001600160a01b0316611294565b600061060a8284610e80565b1561061757506000610642565b60006106238484610f54565b905060006106318585611294565b905061063d82826112fb565b925050505b92915050565b60095481565b6002818154811061065b57fe5b60009182526020909120600290910201805460019091015490915082565b600061068443610e73565b905090565b60006106958383610fbc565b6001600160a01b0384166000908152600160205260409020600281018290559091506106bf611355565b600b820155600a8101839055600281015460408051858152602081019290925280516001600160a01b038716927f6aa46aa24dd78d66eaff80fdc122ff406f1b5afe46204d8008b60282c8ec79af92908290030190a250505050565b600c546001600160a01b031681565b62093a8081565b60006106426003836113d0565b6003818154811061065b57fe5b336000908152600160205260408120906107676005830161150f565b90506001600160a01b0381166107c4576040805162461bcd60e51b815260206004820152601860248201527f4e6f742063757272656e746c792064656c65676174696e670000000000000000604482015290519081900360640190fd5b60006107d28360010161151b565b6001600160a01b03831660009081526001602090815260409182902082518084019093524383529293506006830191908101610817856108118561151b565b90611527565b90528154600180820184556000938452602080852084516002948502909101908155938101519382019390935560408051808201825243815280850186815260058b0180548086018255908852958720915195909402019384559151920180546001600160a01b0319166001600160a01b03938416179055519085169133917f1af5b1c85495b3618ea659a1ba256c8b8974b437297d3b914e321e086a28da729190a350505050565b60085481565b600b5481565b60006106428243610e80565b60006106424383611294565b6001600160a01b0381161580159061090557506001600160a01b0381163314155b610947576040805162461bcd60e51b815260206004820152600e60248201526d125b9d985b1a59081d185c99d95d60921b604482015290519081900360640190fd5b610950816108cc565b1561098c5760405162461bcd60e51b815260040180806020018281038252603581526020018061197e6035913960400191505060405180910390fd5b336000908152600160208190526040822091906109aa90830161151b565b905060006109ba8360050161150f565b90506001600160a01b03811615610a5457836001600160a01b0316816001600160a01b031614156109ed57505050610b49565b6001600160a01b03811660009081526001602090815260409182902082518084019093524383529160068301918101610a29866108118561151b565b9052815460018181018455600093845260209384902083516002909302019182559290910151910155505b6001600160a01b03841660009081526001602090815260409182902082518084019093524383529160068301918101610a9686610a908561151b565b906112fb565b9052815460018082018455600093845260208085208451600294850290910190815593810151938201939093556040805180820182524381526001600160a01b038b811682870181815260058d0180548088018255908a5297892093519790960290920195865593519490920180546001600160a01b03191694909316939093179091559051909133917f4bc154dd35d6a5cb9206482ecb473cdbf2473006d6bce728b9cc0741bcc59ea29190a3505050505b50565b600061064243836105fe565b610b654262093a806112b9565b811115610b7157600080fd5b806005541015610b4957600554600090610b8c9060016112fb565b90506000610b9a600361151b565b905060005b838311610dce576000546040805163bbb30c5d60e01b815230600482015290516001600160a01b039092169163bbb30c5d91602480820192602092909190829003018186803b158015610bf157600080fd5b505afa158015610c05573d6000803e3d6000fd5b505050506040513d6020811015610c1b57600080fd5b5051610c9157604080518082018252600080825243602080840191825287835260048152848320935184559051600190930192909255600b54835191825291810191909152815185927fce8f0c0868b3497f8bb005e8ee9d6f967e32053f5290e2c1c3390e106b92cde4928290030190a2610dbc565b610c9a82611569565b6000610cc46305f5e100610cbe6034610cbe600b548861167b90919063ffffffff16565b906112b9565b604080518082018252828152436020808301918252600089815260049091529290922090518155905160019091015590508015610d7b5760008054604080516340c10f1960e01b81523060048201526024810185905290516001600160a01b03909216926340c10f199260448084019382900301818387803b158015610d4957600080fd5b505af1158015610d5d573d6000803e3d6000fd5b50505050610d7481846112fb90919063ffffffff16565b9250600191505b600b54604080518381526020810192909252805186927fce8f0c0868b3497f8bb005e8ee9d6f967e32053f5290e2c1c3390e106b92cde492908290030190a2505b610dc78360016112fb565b9250610b9f565b60058490558015610e505760408051808201909152438152602081018381526003805460018101825560009190915291517fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b600290930292830155517fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85c909101555b50505050565b60065481565b600061068443610731565b60055481565b60075481565b60006106426002836113d0565b6001600160a01b03821660009081526001602052604081208190610ea790600501846116d4565b6001600160a01b03161515949350505050565b6001602052600090815260409020805460028201546003830154600484015460078501546008860154600a870154600b9097015495969495939460ff909316939192909188565b6000610642610f0e610679565b610cbe610f19610e5c565b610f2286610f4c565b9061167b565b7f000000000000000000000000000000000000000000000000000000000000000081565b600061064243835b6001600160a01b03811660009081526001602081905260408220610f799101846113d0565b9392505050565b603481565b600061064282610f984262093a806112b9565b610fbc565b600a5481565b6004602052600090815260409020805460019091015482565b600080610fc7611828565b9050610fd281610b58565b6000610fe14262093a806112b9565b90506000610fed611355565b6001600160a01b0387166000908152600160205260409020600a8101549192509083871180159061101d57508087115b801561102857508287115b61106a576040805162461bcd60e51b815260206004820152600e60248201526d125b9d985b1a59081d185c99d95d60921b604482015290519081900360640190fd5b82811015611108576000835b8881116110fb576000818152600460205260408120600181015490919061109f906002906113d0565b905060006110b48760010184600101546113d0565b90506110db6110d483610cbe84876000015461167b90919063ffffffff16565b86906112fb565b94505050506110f46001826112fb90919063ffffffff16565b9050611076565b50955061128d9350505050565b6002820154600061111a8360016112fb565b90505b88811161119b5760008181526004602052604081206001810154909190611146906002906113d0565b9050600061115b8760010184600101546113d0565b905061117b6110d483610cbe84876000015461167b90919063ffffffff16565b94505050506111946001826112fb90919063ffffffff16565b905061111d565b506111c77f000000000000000000000000000000000000000000000000000000000000000060346112fb565b881061128657600b8301545b6111de856001611527565b81116112845760006004816111f4846034611527565b815260200190815260200160002090506000611215600283600101546113d0565b9050600061122a8760010184600101546113d0565b9050600061124983610cbe84876000015461167b90919063ffffffff16565b9050808611611259576000611263565b6112638682611527565b95505050505061127d6001826112fb90919063ffffffff16565b90506111d3565b505b9550505050505b5092915050565b6001600160a01b0381166000908152600160205260408120610f7990600601846113d0565b6000610f7983836040518060400160405280601a81526020017f536166654d6174683a206469766973696f6e206279207a65726f000000000000815250611881565b600082820183811015610f79576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b6000806113654262093a806112b9565b90506113927f000000000000000000000000000000000000000000000000000000000000000060346112fb565b8110156113bf577f00000000000000000000000000000000000000000000000000000000000000006113ca565b6113ca816034611527565b91505090565b81546000906113e157506000610642565b825483906113f0906001611527565b815481106113fa57fe5b90600052602060002090600202016000015482106114445782548390611421906001611527565b8154811061142b57fe5b9060005260206000209060020201600101549050610642565b8260008154811061145157fe5b90600052602060002090600202016000015482101561147257506000610642565b82546000908190611484906001611527565b90505b818111156114e75760006114a56002610cbe6001610a9086886112fb565b9050848682815481106114b457fe5b906000526020600020906002020160000154116114d3578092506114e1565b6114de816001611527565b91505b50611487565b8482815481106114f357fe5b9060005260206000209060020201600101549250505092915050565b600061064282436116d4565b600061064282436113d0565b6000610f7983836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250611923565b60085461157b57600654600b55610b49565b6000600854821061159957600854611594908390611527565b6115a6565b6008546115a69083611527565b905060006115c7600854610cbe6305f5e1008561167b90919063ffffffff16565b905060006115e7620f4240610cbe6009548561167b90919063ffffffff16565b9050600060085485101561161a576116136305f5e100610cbe61160a82866112fb565b600b549061167b565b9050611644565b816305f5e1001161162c576000611641565b6116416305f5e100610cbe61160a8286611527565b90505b60065481101561165957600654600b55611674565b60075481111561166e57600754600b55611674565b600b8190555b5050505050565b60008261168a57506000610642565b8282028284828161169757fe5b0414610f795760405162461bcd60e51b81526004018080602001828103825260218152602001806119b36021913960400191505060405180910390fd5b81546000906116e557506000610642565b825483906116f4906001611527565b815481106116fe57fe5b90600052602060002090600202016000015482106117535782548390611725906001611527565b8154811061172f57fe5b60009182526020909120600160029092020101546001600160a01b03169050610642565b8260008154811061176057fe5b90600052602060002090600202016000015482101561178157506000610642565b82546000908190611793906001611527565b90505b818111156117f65760006117b46002610cbe6001610a9086886112fb565b9050848682815481106117c357fe5b906000526020600020906002020160000154116117e2578092506117f0565b6117ed816001611527565b91505b50611796565b84828154811061180257fe5b60009182526020909120600290910201600101546001600160a01b031695945050505050565b6000806118384262093a806112b9565b905060006118516005548361152790919063ffffffff16565b905060058111156118785761187361186a8260026112b9565b600554906112fb565b61187a565b815b9250505090565b6000818361190d5760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b838110156118d25781810151838201526020016118ba565b50505050905090810190601f1680156118ff5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b50600083858161191957fe5b0495945050505050565b600081848411156119755760405162461bcd60e51b81526020600482018181528351602484015283519092839260449091019190850190808383600083156118d25781810151838201526020016118ba565b50505090039056fe43616e6e6f742064656c656761746520746f206120757365722077686f2069732063757272656e746c792064656c65676174696e67536166654d6174683a206d756c7469706c69636174696f6e206f766572666c6f77a26469706673582212205cf5c4318069506b98aa37bcd7a4c4405b584243911e8198ff8271b13a7bc03d64736f6c634300060c0033";