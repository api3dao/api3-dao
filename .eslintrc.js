module.exports = {
    "env": {
        "node": true
    },
    "extends": "eslint:recommended",
    "globals": {
      "beforeEach": false,
      "context": false,
      "describe": false,
      "ethers": false,
      "it": false
    },
    "parserOptions": {
        "ecmaVersion": 11,
        "sourceType": "module"
    }
};
