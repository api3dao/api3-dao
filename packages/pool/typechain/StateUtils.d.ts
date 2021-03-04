/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface StateUtilsInterface extends ethers.utils.Interface {
  functions: {
    "claimsManager()": FunctionFragment;
    "currentApr()": FunctionFragment;
    "genesisEpoch()": FunctionFragment;
    "getUserLocked(address)": FunctionFragment;
    "getUserLockedAt(address,uint256)": FunctionFragment;
    "lastEpochPaid()": FunctionFragment;
    "maxApr()": FunctionFragment;
    "minApr()": FunctionFragment;
    "payReward(uint256)": FunctionFragment;
    "rewardEpochLength()": FunctionFragment;
    "rewardVestingPeriod()": FunctionFragment;
    "rewards(uint256)": FunctionFragment;
    "stakeTarget()": FunctionFragment;
    "totalShares(uint256)": FunctionFragment;
    "totalStaked(uint256)": FunctionFragment;
    "unstakeWaitPeriod()": FunctionFragment;
    "updateCoeff()": FunctionFragment;
    "updateUserLocked(address,uint256)": FunctionFragment;
    "users(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "claimsManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "currentApr",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "genesisEpoch",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getUserLocked",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getUserLockedAt",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "lastEpochPaid",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "maxApr", values?: undefined): string;
  encodeFunctionData(functionFragment: "minApr", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "payReward",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "rewardEpochLength",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "rewardVestingPeriod",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "rewards",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "stakeTarget",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "totalShares",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalStaked",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "unstakeWaitPeriod",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updateCoeff",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updateUserLocked",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "users", values: [string]): string;

  decodeFunctionResult(
    functionFragment: "claimsManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "currentApr", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "genesisEpoch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUserLocked",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUserLockedAt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastEpochPaid",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "maxApr", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "minApr", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "payReward", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "rewardEpochLength",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rewardVestingPeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "rewards", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stakeTarget",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalShares",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalStaked",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unstakeWaitPeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateCoeff",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateUserLocked",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "users", data: BytesLike): Result;

  events: {
    "Epoch(uint256,uint256,uint256)": EventFragment;
    "UserUpdate(address,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Epoch"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UserUpdate"): EventFragment;
}

export class StateUtils extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: StateUtilsInterface;

  functions: {
    claimsManager(overrides?: CallOverrides): Promise<[string]>;

    "claimsManager()"(overrides?: CallOverrides): Promise<[string]>;

    currentApr(overrides?: CallOverrides): Promise<[BigNumber]>;

    "currentApr()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    genesisEpoch(overrides?: CallOverrides): Promise<[BigNumber]>;

    "genesisEpoch()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    getUserLocked(
      userAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "getUserLocked(address)"(
      userAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    getUserLockedAt(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "getUserLockedAt(address,uint256)"(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    lastEpochPaid(overrides?: CallOverrides): Promise<[BigNumber]>;

    "lastEpochPaid()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    maxApr(overrides?: CallOverrides): Promise<[BigNumber]>;

    "maxApr()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    minApr(overrides?: CallOverrides): Promise<[BigNumber]>;

    "minApr()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    payReward(
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "payReward(uint256)"(
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    rewardEpochLength(overrides?: CallOverrides): Promise<[BigNumber]>;

    "rewardEpochLength()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    rewardVestingPeriod(overrides?: CallOverrides): Promise<[BigNumber]>;

    "rewardVestingPeriod()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    rewards(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount: BigNumber; atBlock: BigNumber }
    >;

    "rewards(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount: BigNumber; atBlock: BigNumber }
    >;

    stakeTarget(overrides?: CallOverrides): Promise<[BigNumber]>;

    "stakeTarget()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    totalShares(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
    >;

    "totalShares(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
    >;

    totalStaked(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
    >;

    "totalStaked(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
    >;

    unstakeWaitPeriod(overrides?: CallOverrides): Promise<[BigNumber]>;

    "unstakeWaitPeriod()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    updateCoeff(overrides?: CallOverrides): Promise<[BigNumber]>;

    "updateCoeff()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    updateUserLocked(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "updateUserLocked(address,uint256)"(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    users(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ] & {
        unstaked: BigNumber;
        locked: BigNumber;
        vesting: BigNumber;
        unstakeScheduledFor: BigNumber;
        unstakeAmount: BigNumber;
        lastUpdateEpoch: BigNumber;
        oldestLockedEpoch: BigNumber;
      }
    >;

    "users(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ] & {
        unstaked: BigNumber;
        locked: BigNumber;
        vesting: BigNumber;
        unstakeScheduledFor: BigNumber;
        unstakeAmount: BigNumber;
        lastUpdateEpoch: BigNumber;
        oldestLockedEpoch: BigNumber;
      }
    >;
  };

  claimsManager(overrides?: CallOverrides): Promise<string>;

  "claimsManager()"(overrides?: CallOverrides): Promise<string>;

  currentApr(overrides?: CallOverrides): Promise<BigNumber>;

  "currentApr()"(overrides?: CallOverrides): Promise<BigNumber>;

  genesisEpoch(overrides?: CallOverrides): Promise<BigNumber>;

  "genesisEpoch()"(overrides?: CallOverrides): Promise<BigNumber>;

  getUserLocked(
    userAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "getUserLocked(address)"(
    userAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  getUserLockedAt(
    userAddress: string,
    targetEpoch: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "getUserLockedAt(address,uint256)"(
    userAddress: string,
    targetEpoch: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  lastEpochPaid(overrides?: CallOverrides): Promise<BigNumber>;

  "lastEpochPaid()"(overrides?: CallOverrides): Promise<BigNumber>;

  maxApr(overrides?: CallOverrides): Promise<BigNumber>;

  "maxApr()"(overrides?: CallOverrides): Promise<BigNumber>;

  minApr(overrides?: CallOverrides): Promise<BigNumber>;

  "minApr()"(overrides?: CallOverrides): Promise<BigNumber>;

  payReward(
    targetEpoch: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "payReward(uint256)"(
    targetEpoch: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  rewardEpochLength(overrides?: CallOverrides): Promise<BigNumber>;

  "rewardEpochLength()"(overrides?: CallOverrides): Promise<BigNumber>;

  rewardVestingPeriod(overrides?: CallOverrides): Promise<BigNumber>;

  "rewardVestingPeriod()"(overrides?: CallOverrides): Promise<BigNumber>;

  rewards(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { amount: BigNumber; atBlock: BigNumber }
  >;

  "rewards(uint256)"(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { amount: BigNumber; atBlock: BigNumber }
  >;

  stakeTarget(overrides?: CallOverrides): Promise<BigNumber>;

  "stakeTarget()"(overrides?: CallOverrides): Promise<BigNumber>;

  totalShares(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
  >;

  "totalShares(uint256)"(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
  >;

  totalStaked(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
  >;

  "totalStaked(uint256)"(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
  >;

  unstakeWaitPeriod(overrides?: CallOverrides): Promise<BigNumber>;

  "unstakeWaitPeriod()"(overrides?: CallOverrides): Promise<BigNumber>;

  updateCoeff(overrides?: CallOverrides): Promise<BigNumber>;

  "updateCoeff()"(overrides?: CallOverrides): Promise<BigNumber>;

  updateUserLocked(
    userAddress: string,
    targetEpoch: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "updateUserLocked(address,uint256)"(
    userAddress: string,
    targetEpoch: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  users(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<
    [
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber
    ] & {
      unstaked: BigNumber;
      locked: BigNumber;
      vesting: BigNumber;
      unstakeScheduledFor: BigNumber;
      unstakeAmount: BigNumber;
      lastUpdateEpoch: BigNumber;
      oldestLockedEpoch: BigNumber;
    }
  >;

  "users(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<
    [
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber
    ] & {
      unstaked: BigNumber;
      locked: BigNumber;
      vesting: BigNumber;
      unstakeScheduledFor: BigNumber;
      unstakeAmount: BigNumber;
      lastUpdateEpoch: BigNumber;
      oldestLockedEpoch: BigNumber;
    }
  >;

  callStatic: {
    claimsManager(overrides?: CallOverrides): Promise<string>;

    "claimsManager()"(overrides?: CallOverrides): Promise<string>;

    currentApr(overrides?: CallOverrides): Promise<BigNumber>;

    "currentApr()"(overrides?: CallOverrides): Promise<BigNumber>;

    genesisEpoch(overrides?: CallOverrides): Promise<BigNumber>;

    "genesisEpoch()"(overrides?: CallOverrides): Promise<BigNumber>;

    getUserLocked(
      userAddress: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getUserLocked(address)"(
      userAddress: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getUserLockedAt(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getUserLockedAt(address,uint256)"(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lastEpochPaid(overrides?: CallOverrides): Promise<BigNumber>;

    "lastEpochPaid()"(overrides?: CallOverrides): Promise<BigNumber>;

    maxApr(overrides?: CallOverrides): Promise<BigNumber>;

    "maxApr()"(overrides?: CallOverrides): Promise<BigNumber>;

    minApr(overrides?: CallOverrides): Promise<BigNumber>;

    "minApr()"(overrides?: CallOverrides): Promise<BigNumber>;

    payReward(
      targetEpoch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "payReward(uint256)"(
      targetEpoch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    rewardEpochLength(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardEpochLength()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewardVestingPeriod(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardVestingPeriod()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewards(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount: BigNumber; atBlock: BigNumber }
    >;

    "rewards(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount: BigNumber; atBlock: BigNumber }
    >;

    stakeTarget(overrides?: CallOverrides): Promise<BigNumber>;

    "stakeTarget()"(overrides?: CallOverrides): Promise<BigNumber>;

    totalShares(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
    >;

    "totalShares(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
    >;

    totalStaked(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
    >;

    "totalStaked(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { fromBlock: BigNumber; value: BigNumber }
    >;

    unstakeWaitPeriod(overrides?: CallOverrides): Promise<BigNumber>;

    "unstakeWaitPeriod()"(overrides?: CallOverrides): Promise<BigNumber>;

    updateCoeff(overrides?: CallOverrides): Promise<BigNumber>;

    "updateCoeff()"(overrides?: CallOverrides): Promise<BigNumber>;

    updateUserLocked(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "updateUserLocked(address,uint256)"(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    users(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ] & {
        unstaked: BigNumber;
        locked: BigNumber;
        vesting: BigNumber;
        unstakeScheduledFor: BigNumber;
        unstakeAmount: BigNumber;
        lastUpdateEpoch: BigNumber;
        oldestLockedEpoch: BigNumber;
      }
    >;

    "users(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ] & {
        unstaked: BigNumber;
        locked: BigNumber;
        vesting: BigNumber;
        unstakeScheduledFor: BigNumber;
        unstakeAmount: BigNumber;
        lastUpdateEpoch: BigNumber;
        oldestLockedEpoch: BigNumber;
      }
    >;
  };

  filters: {
    Epoch(
      epoch: BigNumberish | null,
      rewardAmount: null,
      newApr: null
    ): EventFilter;

    UserUpdate(user: string | null, toEpoch: null, locked: null): EventFilter;
  };

  estimateGas: {
    claimsManager(overrides?: CallOverrides): Promise<BigNumber>;

    "claimsManager()"(overrides?: CallOverrides): Promise<BigNumber>;

    currentApr(overrides?: CallOverrides): Promise<BigNumber>;

    "currentApr()"(overrides?: CallOverrides): Promise<BigNumber>;

    genesisEpoch(overrides?: CallOverrides): Promise<BigNumber>;

    "genesisEpoch()"(overrides?: CallOverrides): Promise<BigNumber>;

    getUserLocked(
      userAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "getUserLocked(address)"(
      userAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    getUserLockedAt(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "getUserLockedAt(address,uint256)"(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    lastEpochPaid(overrides?: CallOverrides): Promise<BigNumber>;

    "lastEpochPaid()"(overrides?: CallOverrides): Promise<BigNumber>;

    maxApr(overrides?: CallOverrides): Promise<BigNumber>;

    "maxApr()"(overrides?: CallOverrides): Promise<BigNumber>;

    minApr(overrides?: CallOverrides): Promise<BigNumber>;

    "minApr()"(overrides?: CallOverrides): Promise<BigNumber>;

    payReward(
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "payReward(uint256)"(
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    rewardEpochLength(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardEpochLength()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewardVestingPeriod(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardVestingPeriod()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewards(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    "rewards(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stakeTarget(overrides?: CallOverrides): Promise<BigNumber>;

    "stakeTarget()"(overrides?: CallOverrides): Promise<BigNumber>;

    totalShares(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "totalShares(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalStaked(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "totalStaked(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    unstakeWaitPeriod(overrides?: CallOverrides): Promise<BigNumber>;

    "unstakeWaitPeriod()"(overrides?: CallOverrides): Promise<BigNumber>;

    updateCoeff(overrides?: CallOverrides): Promise<BigNumber>;

    "updateCoeff()"(overrides?: CallOverrides): Promise<BigNumber>;

    updateUserLocked(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "updateUserLocked(address,uint256)"(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    users(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    "users(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    claimsManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "claimsManager()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    currentApr(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "currentApr()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    genesisEpoch(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "genesisEpoch()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getUserLocked(
      userAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "getUserLocked(address)"(
      userAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    getUserLockedAt(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "getUserLockedAt(address,uint256)"(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    lastEpochPaid(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "lastEpochPaid()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    maxApr(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "maxApr()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    minApr(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "minApr()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    payReward(
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "payReward(uint256)"(
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    rewardEpochLength(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "rewardEpochLength()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    rewardVestingPeriod(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "rewardVestingPeriod()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    rewards(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "rewards(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    stakeTarget(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "stakeTarget()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalShares(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "totalShares(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalStaked(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "totalStaked(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    unstakeWaitPeriod(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "unstakeWaitPeriod()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    updateCoeff(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "updateCoeff()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updateUserLocked(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "updateUserLocked(address,uint256)"(
      userAddress: string,
      targetEpoch: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    users(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "users(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
