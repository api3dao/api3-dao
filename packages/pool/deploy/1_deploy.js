module.exports = async ({ getUnnamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const accounts = await getUnnamedAccounts();

  if (network.name == "mainnet") {
    await deploy("Api3Pool", {
      from: accounts[0],
      args: ["0x0b38210ea11411557c13457D4dA7dC6ea731B88a"],
    });
  } else {
    const api3Token = await deploy("Api3Token", {
      from: accounts[0],
      args: [accounts[0], accounts[0]],
    });
    await deploy("Api3Pool", {
      from: accounts[0],
      args: [api3Token.address],
    });
  }
};
