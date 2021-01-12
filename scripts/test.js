const hre = require("hardhat");

async function main() {
  const accounts = await hre.waffle.provider.listAccounts();
  const Api3Token = await hre.ethers.getContractFactory("Api3Token");
  const api3Token = await Api3Token.deploy(accounts[0], accounts[0]);

  const Api3Pool = await hre.ethers.getContractFactory("Api3Pool");
  const api3Pool = await Api3Pool.deploy(api3Token.address);
  console.log(api3Pool.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
