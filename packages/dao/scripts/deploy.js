/*global artifacts, web3*/

const deployTemplate = require("@aragon/templates-shared/scripts/deploy-template");

const TEMPLATE_NAME = "api3-template";
const CONTRACT_NAME = "Api3Template";
const VOTE_NAME = "Api3Voting";

module.exports = (callback) =>
  deployTemplate(web3, artifacts, TEMPLATE_NAME, CONTRACT_NAME, [
    { name: "agent", contractName: "Agent" },
    { name: "vault", contractName: "Vault" },
    { name: "api3voting", contractName: VOTE_NAME },
    { name: "survey", contractName: "Survey" },
    { name: "payroll", contractName: "Payroll" },
    { name: "finance", contractName: "Finance" },
    { name: "token-manager", contractName: "TokenManager" },
  ])
    .then(async (template) => {
      console.log(template.address);
      callback();
    })
    .catch(callback);
