const { expect } = require("chai");

let roles;
let api3Template, api3Pool;



beforeEach(async () => {
    const accounts = await ethers.getSigners();
    roles = {
        deployer: accounts[0],
        daoAgent: accounts[1],
        claimsManager: accounts[2],
        user1: accounts[3],
        user2: accounts[4],
        randomPerson: accounts[9],
    };

    const api3TemplateFactory = await ethers.getContractFactory(
        "Api3Template",
        roles.deployer
    );

    // TODO: Problems are here, to create DaoFactory, I need to create at least three another contracts,
    // TODO: and I need DAOFactory to create api3Template
    // TODO: + this way of contract creation(it is used in pool as well) is a mess
    const DaoFactoryFactory = await ethers.getContractFactory(
        "DAOFactory",
        roles.deployer
    );
    const ENSFactory = await ethers.getContractFactory(
        "ENS",
        roles.deployer
    );
    const MiniMeTokenFactoryFactory = await ethers.getContractFactory(
        "MiniMeTokenFactory",
        roles.deployer
    );
    // const FIFSResolvingRegistrarFactory = await ethers.getContractFactory(
    //     "FIFSResolvingRegistrar",
    //     roles.deployer
    // );

    const daoFactory =  await DaoFactoryFactory.deploy(
        roles.deployer.address
    );
    //
    // const ens =  await ENSFactory.deploy(
    //     roles.deployer.address
    // );
    //
    // const miniMeTokenFactory =  await MiniMeTokenFactoryFactory.deploy(
    //     roles.deployer.address
    // );

    // const fifsResolvingRegistrar =  await FIFSResolvingRegistrarFactory.new(
    //     roles.deployer.address
    // );

    // api3Template = await api3TemplateFactory.deploy(
    //     roles.deployer.address,
    //     roles.deployer.address
    // );
});

describe("api3template tests", function () {
    context("creation of the api3", function () {
        it("Construction", async function () {

        });
    });
});
