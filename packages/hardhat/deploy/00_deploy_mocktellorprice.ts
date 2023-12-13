import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "MockPriceContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMockPriceContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

  // Sepolia Testnet
  // Token: 0x80fc34a2f9FfE86F41580F47368289C402DEc660
  // Oracle: 0xB19584Be015c04cf6CFBF6370Fe94a58b7A38830
  const Oracle = "0xB19584Be015c04cf6CFBF6370Fe94a58b7A38830";
  // Governance: 0xA192f62726ea27979146dfF94f886a8E4Eb6D7A5
  // Autopay: 0xB59a8085b4C360a3694396CA8E09441052656cF6
  // DataSpecs: 0x9413c3b2Fb74A7b7e6CDeBa683b31646Ceb534F2

  await deploy("MockPriceContract", {
    from: deployer,
    // Contract constructor arguments
    args: [Oracle],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const MockPriceContract = await hre.ethers.getContract("MockPriceContract", deployer);
  // const tx = await MockPriceContract.setBtcPrice();
  // await tx.wait;
};

export default deployMockPriceContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags MockPriceContract
deployMockPriceContract.tags = ["MockPriceContract"];
