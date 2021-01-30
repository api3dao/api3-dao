// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat";

const contractOwner = "0x44A814f80c14977481b47C613CD020df6ea3D25D"
const mintingDestination = "0x44A814f80c14977481b47C613CD020df6ea3D25D"

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Api3Token = await hre.ethers.getContractFactory("Api3Token");
  const api3Token = await Api3Token.deploy(contractOwner, mintingDestination);

  await api3Token.deployed();

  console.log("api3Token deployed to:", api3Token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
