module.exports = async ({ getUnnamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const accounts = await getUnnamedAccounts();

  if (network.name == "mainnet") {
    await deploy("Convenience", {
      from: accounts[0],
      args: ["..."],
    });
  } else {
    await deploy("Convenience", {
      from: accounts[0],
      args: ["..."],
    });
  }
};
