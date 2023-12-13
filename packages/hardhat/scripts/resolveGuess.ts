import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { promises as fs } from "fs";
import hre from "hardhat";
import { Guess, Verifier, MockPriceContract } from "../typechain-types";
import { ProofStruct, G1PointStruct, G2PointStruct } from "../typechain-types/contracts/Guess.sol/Guess";
import { hexZeroPad, hexlify } from "ethers/lib/utils";
import { BigNumber } from "ethers";

// async function findFiles(pattern: string): Promise<string[]> {
//   const directory = "../zokrates";
//   const files = await fs.readdir(directory);
//   // console.log(`Files in ${directory}: ${files}`);
//   return files.filter(file => file.startsWith(pattern)).map(file => directory + "/" + file);
// }

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  // Get 8 accounts
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();

  const guessContract = (await hre.ethers.getContract("Guess", deployer)) as Guess;
  const verifierContract = (await hre.ethers.getContract("Verifier", deployer)) as Verifier;
  const mockPriceContract = (await hre.ethers.getContract("MockPriceContract", deployer)) as MockPriceContract;
  let guessingIsAllowed = await guessContract.guessingIsAllowed();
  if (!guessingIsAllowed) {
    console.log("Guessing is not allowed");
    // return;
  } else {
    await mockPriceContract.setBtcPriceShadow(hre.ethers.utils.parseEther('42000'));
    await (await guessContract.closeGuessingAndResolvePrice()).wait();
    guessingIsAllowed = await guessContract.guessingIsAllowed();
  }
  if (guessingIsAllowed) {
    console.log("Guessing is still allowed");
    return;
  }

  // target btc price is 42000
  const btcPrice = hre.ethers.utils.formatEther(await guessContract.btcPrice());
  console.log(`BTC price is ${btcPrice}`);

  const order = [7, 6, 5, 0, 1, 2];
  // const order = [2];
  for (let idx = 0; idx < order.length; idx++) {
    const i = order[idx];
    const price = 40000 + i * 1000;
    // const nullifier = i ? (1111 * i).toString() : "0000";
    const nullifier = (1111 * i).toString();
    const w = JSON.parse(await fs.readFile(`witness_${nullifier}_${price}.json`, "utf-8"));

    const proofJSON = JSON.parse(await fs.readFile(`proof_${nullifier}_${price}.json`, 'utf8'));

    // witness from hash.zok
    // return [[guess, nullifier], myHashedGuess, nullifierHash, merkleRoot,
    // hashedGuesses[0], hashedGuesses[1], hashedGuesses[2], hashedGuesses[3], hashedGuesses[4], hashedGuesses[5], hashedGuesses[6], hashedGuesses[7]];

    // args to guessinhashes
    // def main(
    //   public field guess,
    //   private field nullifier,
    //   private field[2] myHashedGuessTEST, // make test consistent
    //   public field[2] nullifierHash,
    //   public field[2] committedRoot,
    //   private field[8][2] hashedGuesses) {

    // function updateBest(
    //   Proof memory proof,
    //   uint guessValue,
    //   uint nullifierHash1,
    //   uint nullifierHash2,
    //   uint hashedGuessesRoot1,
    //   uint hashedGuessesRoot2
    // ) public guessingNotAllowed 
    // const proof = [proofJSON.proof.a, proofJSON.proof.b, proofJSON.proof.c] as ProofStruct;
    if (!(proofJSON.proof && proofJSON.proof.a && proofJSON.proof.b && proofJSON.proof.c)) {
      throw new Error(`Proof ${i} is bad`);
    }
    const proof = proofJSON.proof as ProofStruct;
    // console.log(`Proof ${i} is `, proof);
    console.log(`Proof ${i} is `, JSON.stringify([proof.a, proof.b, proof.c]).replace('\n', ''));
    const inputs = [w[0], w[4], w[5], w[6], w[7]].map(BigInt);
    // const inputs = [w[0], w[4], w[5], w[6], w[7]].map(BigNumber);
    // [w[0], w[4], w[5], w[6], w[7]].map(x => hre.ethers.utils.hexZeroPad(hexlify(BigInt(x)), 32)))
    console.log(`Inputs ${i} are `, 
      JSON.stringify(
        [w[0], w[4], w[5], w[6], w[7]].map(
          x => hexlify(BigInt(x))
          // x => hexZeroPad(hexlify(BigInt(x)), 32)
          )
        ).replace('\n', ''));

    // Proof 2 is[["0x1504c4318b6154f93e9edea0cf2133f54b1a5b4758c845845bbd30d67cd8de72", "0x230114bf4de2b35c7ecb87de13e3a6bd2b282356e5c08c713d486a974fffea51"], [["0x217e3b26baf1da4e6e4d49836d86ba9855840a7884a1b766242ca3e7b7aec230", "0x1112d824bee408d6be442cbd32bebe6287285b771c023118a93d4c9ae5ebf069"], ["0x2a3c656dcf6267ce06c12e099dfc8af1682d48287dbc178eb88932f2a4b8a405", "0x24e3fa05cf1fef2365b86030bd2a02b1b3b504bb4030c767fbcd1931209622ea"]], ["0x16e3db2f1298ed70997e964c7d2747411ee3eaf72f2677caa1794ef00e5ec610", "0x1c540cf1b24f256598085b5742aa74c4aa669d4080b125a56ed048b56e78f5e2"]]
// Inputs 2 are["0x08e4d316827686400000", "0x1ef7e8664a33f754acb960556128dd2a", "0x1526e87de6a167b7efff870982475e31", "0xe6403178da849ec42f030f92d9c3f081", "0x99d15d4263f91abfefb2c6e53626b9f0"]
    // ["0x08e4d316827686400000", "0x1ef7e8664a33f754acb960556128dd2a", "0x1526e87de6a167b7efff870982475e31", "0xe6403178da849ec42f030f92d9c3f081", "0x99d15d4263f91abfefb2c6e53626b9f0"]
    console.log('verifyTx', await verifierContract.verifyTx(
      proof,
      [w[0], w[4], w[5], w[6], w[7]]
    ));
    // console.log('check', await guessContract.check(
    //   proof,
    //   [w[0], w[4], w[5], w[6], w[7]]
    // ));
    await guessContract.updateBest(
      proof,
      inputs[0],
      inputs[1],
      inputs[2],
      inputs[3],
      inputs[4],
    );

    console.log('New current best guess is ', hre.ethers.utils.formatEther(await guessContract.currentBestGuess()));
  }
}

main();
