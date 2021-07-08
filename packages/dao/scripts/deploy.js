/*global artifacts, web3, Promise*/
const fs = require("fs");
const { hash: namehash } = require("eth-ens-namehash");
const { getNetworkName } = require("@aragon/templates-shared/lib/network")(
  web3
);
const deployTemplate = require("@aragon/templates-shared/scripts/deploy-template");
const { getEventArgument } = require("@aragon/test-helpers/events");

const Api3Pool = artifacts.require("Api3Pool");
const Api3Token = artifacts.require("Api3Token");
const Convenience = artifacts.require("Convenience");
const TimelockManager = artifacts.require("TimelockManager");

const supportRequiredPct1 = 50e16;
const minAcceptQuorumPct1 = 50e16;
const supportRequiredPct2 = 50e16;
const minAcceptQuorumPct2 = 15e16;

const gasPrice = "35" + "000" + "000" + "000";

/**
 * Returns the address of the deployer
 */
const getDeployer = async () => {
  const [deployer] = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        return reject(err);
      }
      resolve(accounts);
    });
  });

  return deployer;
};

/**
 * This script is used to deploy contracts DAO contracts for dashboard application.
 * For more information about how to use this script see: https://github.com/api3dao/api3-dao/issues/217
 *
 * NOTE: When making changes to this script consult the changes with DAO dashboard developers
 * as they (implicitly) depend on this script.
 */
module.exports = async (callback) => {
  try {
    const network = await getNetworkName();
    const deployer = await getDeployer();

    let api3Token, api3Pool;
    let api3TokenAddress, timelockManagerAddress;
    if (network === "mainnet") {
      api3TokenAddress = "0x0b38210ea11411557c13457D4dA7dC6ea731B88a";
      timelockManagerAddress = "0xFaef86994a37F1c8b2A5c73648F07dd4eFF02baA";
      api3Pool = await Api3Pool.new(api3TokenAddress, timelockManagerAddress, {
        gasPrice: gasPrice,
      });
      // Pass an API3DAOv1 proposal to call the token contract to authorize the pool contract as a minter
      // Pass an API3DAOv1 proposal to call the timelock manager contract to set the pool contract
    } else {
      api3Token = await Api3Token.new(deployer, deployer, {
        gasPrice: gasPrice,
      });
      api3TokenAddress = api3Token.address;
      const timelockManager = await TimelockManager.new(
        api3Token.address,
        deployer,
        { gasPrice: gasPrice }
      );
      timelockManagerAddress = timelockManager.address;
      api3Pool = await Api3Pool.new(
        api3Token.address,
        timelockManager.address,
        { gasPrice: gasPrice }
      );
      await api3Token.updateMinterStatus(api3Pool.address, true, {
        gasPrice: gasPrice,
      });
      await timelockManager.updateApi3Pool(api3Pool.address, {
        gasPrice: gasPrice,
      });
    }

    const convenience = await Convenience.new(api3Pool.address, {
      gasPrice: gasPrice,
    });
    if (network === "mainnet") {
      await convenience.setErc20Addresses(
        [
          api3TokenAddress,
          "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
        ],
        { gasPrice: gasPrice }
      );
    } else {
      await convenience.setErc20Addresses([api3TokenAddress], {
        gasPrice: gasPrice,
      });
    }

    let templateId;
    if (network === "mainnet") {
      templateId = "api3-dao-template.open";
    } else if (network === "rinkeby" || network === "ropsten") {
      templateId = `api3-template-${Math.random()
        .toString(36)
        .substring(7)}.open`;
    } else {
      templateId = `api3-template-${Math.random().toString(36).substring(7)}`;
    }
    const template = await deployTemplate(
      web3,
      artifacts,
      templateId,
      "Api3Template",
      [
        { name: "agent", contractName: "Agent" },
        { name: "vault", contractName: "Vault" },
        { name: "api3voting", contractName: "Api3Voting" },
        { name: "survey", contractName: "Survey" },
        { name: "payroll", contractName: "Payroll" },
        { name: "finance", contractName: "Finance" },
        { name: "token-manager", contractName: "TokenManager" },
      ],
      { gasPrice: gasPrice }
    );

    let daoId;
    if (network === "mainnet") {
      daoId = "api3dao";
    } else {
      daoId = `api3-${Math.random().toString(36).substring(7)}`;
    }
    const api3VotingAppId =
      network === "mainnet" || network === "ropsten" || network === "rinkeby"
        ? namehash("api3voting.open.aragonpm.eth")
        : namehash("api3voting.aragonpm.eth");
    const tx = await template.newInstance(
      daoId,
      api3Pool.address,
      [supportRequiredPct1, minAcceptQuorumPct1],
      [supportRequiredPct2, minAcceptQuorumPct2],
      api3VotingAppId,
      { gasPrice: gasPrice }
    );
    const dao = getEventArgument(tx, "Api3DaoDeployed", "dao");
    const acl = getEventArgument(tx, "Api3DaoDeployed", "acl");
    const primaryVoting = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "primaryVoting"
    );
    const secondaryVoting = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "secondaryVoting"
    );
    const primaryAgent = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "primaryAgent"
    );
    const secondaryAgent = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "secondaryAgent"
    );
    const set_tx = await api3Pool.setDaoApps(
      primaryAgent,
      secondaryAgent,
      primaryVoting,
      secondaryVoting,
      { from: deployer }
    );

    if (network !== "mainnet") {
      await api3Token.transfer(primaryAgent, "100000000000000000000000", {
        gasPrice: gasPrice,
      });
      await api3Token.transfer(secondaryAgent, "50000000000000000000000", {
        gasPrice: gasPrice,
      });
    }

    const deployedAddresses = {
      api3Token: api3TokenAddress,
      timelockManager: timelockManagerAddress,
      api3Pool: api3Pool.address,
      convenience: convenience.address,
      dao: dao,
      acl: acl,
      votingAppPrimary: getEventArgument(
        set_tx,
        "SetDaoApps",
        "votingAppPrimary"
      ).toString(),
      votingAppSecondary: getEventArgument(
        set_tx,
        "SetDaoApps",
        "votingAppSecondary"
      ).toString(),
      agentAppPrimary: getEventArgument(
        set_tx,
        "SetDaoApps",
        "agentAppPrimary"
      ).toString(),
      agentAppSecondary: getEventArgument(
        set_tx,
        "SetDaoApps",
        "agentAppSecondary"
      ).toString(),
    };

    fs.writeFileSync(
      `${network}.deployment.json`,
      JSON.stringify(deployedAddresses, null, 2)
    );
    console.log("\nDEPLOYED ADDRESSES:");
    console.log(JSON.stringify(deployedAddresses, null, 2));
  } catch (error) {
    callback(error);
  }
  callback();
};
