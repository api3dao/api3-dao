/*global artifacts, web3*/

const { getNetworkName } = require("@aragon/templates-shared/lib/network")(
  web3
);
const deployTemplate = require("@aragon/templates-shared/scripts/deploy-template");
const { getEventArgument } = require("@aragon/test-helpers/events");

const TEMPLATE_NAME = "api3-template";
const CONTRACT_NAME = "Api3Template";
const VOTE_NAME = "Api3Voting";

const Api3Pool = artifacts.require("Api3Pool");
const Convenience = artifacts.require("Convenience");

const SUPPORT_1 = 50e16;
const ACCEPTANCE_1 = 50e16;
const VOTING_DURATION_1 = 7 * 24 * 60 * 60;

const SUPPORT_2 = 50e16;
const ACCEPTANCE_2 = 15e16;
const VOTING_DURATION_2 = 7 * 24 * 60 * 60;

module.exports = async (callback) => {
  try {
    const network = await getNetworkName();
    console.log(network);

    const api3Pool = await Api3Pool.new("0x00");
    const convenience = await Convenience.new(api3Pool.address);
    console.log(`Pool: ${api3Pool.address}`);
    console.log(`Convenience: ${convenience.address}`);
    const template = await deployTemplate(
      web3,
      artifacts,
      network === "rinkeby" || network === "mainnet" || network === "ropsten"
        ? TEMPLATE_NAME + ".open"
        : TEMPLATE_NAME,
      CONTRACT_NAME,
      [
        { name: "agent", contractName: "Agent" },
        { name: "vault", contractName: "Vault" },
        { name: "api3voting", contractName: VOTE_NAME },
        { name: "survey", contractName: "Survey" },
        { name: "payroll", contractName: "Payroll" },
        { name: "finance", contractName: "Finance" },
        { name: "token-manager", contractName: "TokenManager" },
      ]
    );
    const tx = await template.newInstance(
      TEMPLATE_NAME,
      api3Pool.address,
      [SUPPORT_1, ACCEPTANCE_1, VOTING_DURATION_1],
      [SUPPORT_2, ACCEPTANCE_2, VOTING_DURATION_2]
    );
    const mainVoting = getEventArgument(tx, "Api3DaoDeployed", "mainVoting");
    const secondaryVoting = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "secondaryVoting"
    );
    const mainAgent = getEventArgument(tx, "Api3DaoDeployed", "mainAgent");
    const secondaryAgent = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "secondaryAgent"
    );
    console.log("Dao: " + getEventArgument(tx, "SetupDao", "dao").toString());
    console.log("Main Voting: " + mainVoting.toString());
    console.log("Secondary Voting: " + secondaryVoting.toString());
    console.log("Main Agent: " + mainAgent.toString());
    console.log("Secondary Agent: " + secondaryAgent.toString());
    const set_tx = await api3Pool.setDaoApps(
      mainAgent,
      secondaryAgent,
      mainVoting,
      secondaryVoting
    );
    console.log(
      "Voting Primary Agent: " +
        getEventArgument(set_tx, "SetDaoApps", "votingAppPrimary").toString()
    );
    console.log(
      "Voting Secondary Agent: " +
        getEventArgument(set_tx, "SetDaoApps", "votingAppSecondary").toString()
    );
    console.log(
      "Dao Primary Agent: " +
        getEventArgument(set_tx, "SetDaoApps", "agentAppPrimary").toString()
    );
    console.log(
      "Dao Secondary Agent: " +
        getEventArgument(set_tx, "SetDaoApps", "agentAppSecondary").toString()
    );
  } catch (error) {
    callback(error);
  }
  callback();
};
//
