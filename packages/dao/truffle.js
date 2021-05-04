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
