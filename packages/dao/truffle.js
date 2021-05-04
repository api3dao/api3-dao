module.exports = require("@aragon/os/truffle-config");
//
module.exports = {
    "compilers": {
        "solc": {
            "version": "0.4.24",
                "settings": {
                "optimizer": {
                    "enabled": true,
                        "runs": 200
                },
                "evmVersion": "byzantium"
            }
        }
    }
};

//     networks: {
//         development: {
//             host: "127.0.0.1",
//             port: 8545,
//             network_id: "*"
//         },
//         rinkeby: {
//             provider: function() {
//                 return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/2d26d6e3bafb42bfa4fa8cc248350d00");
//             },
//             network_id: 4,
//             gas: 4500000,
//             gasPrice: 10000000000,
//         }
//     }
// };
