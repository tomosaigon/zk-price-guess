import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "Guess" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployGuess: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const _ticketPrice = hre.ethers.utils.parseEther("0.01");
  const _verifierContract = await hre.deployments.get("Verifier");
  const _priceContract = await hre.deployments.get("PriceContract");
  // const _priceContract = await hre.deployments.get("MockPriceContract");

  await deploy("Guess", {
    from: deployer,
    // Contract constructor arguments
    args: [_ticketPrice, _verifierContract.address, _priceContract.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const Guess = await hre.ethers.getContract("Guess", deployer);
};

export default deployGuess;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Guess
deployGuess.tags = ["Guess"];
