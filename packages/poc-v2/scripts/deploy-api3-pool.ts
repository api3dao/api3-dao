// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat";
// const hre = require("hardhat");

// As of Jan 23 the API Token && API3PoolAddress for testing in playground
const api3TokenAddress = "0x2bCaE2311b56dA9Da288534aD232406e88984019";
const api3PoolAddress = "0x37639CB06187e32De5b4948C2a58bb6CC3CE41dD";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const API3Pool = await hre.ethers.getContractFactory("Api3Pool");
  const api3Pool = await API3Pool.deploy(api3TokenAddress);

  await api3Pool.deployed();

  console.log("API3Pool deployed to:", api3Pool.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
