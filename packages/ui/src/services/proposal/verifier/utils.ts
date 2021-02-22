import { utils } from "ethers";
const { hexDataSlice, toUtf8Bytes, keccak256 } = utils;

export const getFunctionSignature = (fragment: string) => {
  const functionFragmentBytes = keccak256(toUtf8Bytes(fragment));
  const hexDataSliced = hexDataSlice(functionFragmentBytes, 0, 4);
  return hexDataSliced;
}

export const getEventTopic = (fragment: string) => {
  const eventFragmentBytes = toUtf8Bytes(fragment);
  const eventKeccak256 = keccak256(eventFragmentBytes);
  return eventKeccak256;
}