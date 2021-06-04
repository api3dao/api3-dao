const { exec } = require("child_process");

module.exports = {
  skipFiles: [
    "test",
    "@aragon/os",
    "@aragon/minime",
    "@aragon/contract-helpers-test",
  ],
  onCompileComplete: () => {
    console.log("Post compilation");
    exec(
      "cd ../pool && npm run build && cp ./artifacts/contracts/Api3Pool.sol/Api3Pool.json ../api3-voting/.coverage_artifacts/Api3Pool.json "
    );
  },
};
