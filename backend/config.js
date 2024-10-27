const mainDeployment = require('../contracts/deployments/localhost/Main.json');

const contractAddress = mainDeployment.address;
const contractAbi = mainDeployment.abi;

module.exports = {
  contractAddress,
  contractAbi
};