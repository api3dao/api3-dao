const { expect } = require("chai");
const { time, expectRevert } = require('@openzeppelin/test-helpers');

let roles;
let api3Template, daoFactory, ens, miniMeTokenFactory, fifsResolvingRegistrar, api3TemplateFactory, Api3Template;



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

    api3TemplateFactory = await ethers.getContractFactory(
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
    const KernelFactory = await ethers.getContractFactory(
        "Kernel",
        roles.deployer
    );
    const ACLFactory = await ethers.getContractFactory(
        "ACL",
        roles.deployer
    );
    const EVMScriptRegistryFactoryFactory = await ethers.getContractFactory(
        "EVMScriptRegistryFactory",
        roles.deployer
    );
    const PublicResolverFactory = await ethers.getContractFactory(
        "PublicResolver",
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
    const FIFSResolvingRegistrarFactory = await ethers.getContractFactory(
        "FIFSResolvingRegistrar",
        roles.deployer
    );

    const kernel = await KernelFactory.deploy(true);
    const acl = await ACLFactory.deploy();
    const evmScriptRegistryFactory = await EVMScriptRegistryFactoryFactory.deploy();

    daoFactory =  await DaoFactoryFactory.deploy(
        kernel.address,
        acl.address,
        evmScriptRegistryFactory.address
    );

    ens =  await ENSFactory.deploy();

    const publicResolver = await PublicResolverFactory.deploy(ens.address);

    miniMeTokenFactory =  await MiniMeTokenFactoryFactory.deploy();

    fifsResolvingRegistrar =  await FIFSResolvingRegistrarFactory.deploy(
        ens.address,
        publicResolver.address,
        '0x0000000000000000000000000000000000000000000000000000000000000000'
    );
});

describe("api3template tests", function () {
    context("creation of the api3", function () {
        // TODO: No idea how to check if constructor is reverted
        it("construction revert because of contracts addresses", async () => {

            try {
                await api3TemplateFactory.deploy(
                    "0x0000000000000000000000000000000000000000",
                    ens.address,
                    miniMeTokenFactory.address,
                    fifsResolvingRegistrar.address
                );
                throw new Error("Test without daoFactory works");
            } catch(error) {
                console.log(error.toString());
                expect(error.toString()).to.equal("Error: VM Exception while processing transaction: revert TEMPLATE_DAO_FAC_NOT_CONTRACT");
            }

            try {
                await api3TemplateFactory.deploy(
                    daoFactory.address,
                    "0x0000000000000000000000000000000000000000",
                    miniMeTokenFactory.address,
                    fifsResolvingRegistrar.address
                );
                throw new Error("Test without ENS works");
            } catch(error) {
                console.log(error.toString());
                expect(error.toString()).to.equal("Error: VM Exception while processing transaction: revert TEMPLATE_ENS_NOT_CONTRACT");
            }

        });

        it("construction completes correctly", async () => {
            await api3TemplateFactory.deploy(
                daoFactory.address,
                ens.address,
                miniMeTokenFactory.address,
                fifsResolvingRegistrar.address
            );
        });

    });
});
