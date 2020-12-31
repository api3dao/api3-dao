const Migrations = artifacts.require("Migrations");

module.exports = function(deployer, networkName, accounts) {
  deployer.deploy(Migrations);
};
