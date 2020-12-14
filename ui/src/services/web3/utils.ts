import { utils } from "ethers";
import BN from "bn.js";

type BN = any;

export function fromWei(amount: BN): string {
  const etherAmount = utils.formatEther(amount.toString());
  return etherAmount.toString();
}

export function toWei(amount: string | number ): BN {
  const weiAmount = utils.parseEther(amount.toString());
  return new BN(weiAmount.toString());
}