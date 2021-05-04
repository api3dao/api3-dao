module.exports = {
    // Called before a dao is deployed.
    preDao: async ({}, { web3, artifacts }) => {},

    // Called after a dao is deployed.
    postDao: async ({ dao }, { web3, artifacts }) => {},

    // Called after the app's proxy is created, but before it's initialized.
    preInit: async ({ proxy }, { web3, artifacts }) => {},

    // Called after the app's proxy is initialized.
    postInit: async ({ proxy }, { web3, artifacts }) => {},

    // Called when the start task needs to know the app proxy's init parameters.
    // Must return an array with the proxy's init parameters.
    getInitParams: async ({}, { web3, artifacts }) => {
        return ['0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb',80,50,1000]
    },

    // Called after the app's proxy is updated with a new implementation.
    postUpdate: async ({ proxy }, { web3, artifacts }) => {},
}
//"registry": "0x98df287b6c145399aaa709692c8d308357bc085d",
