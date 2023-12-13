import hre from "hardhat";
import { Guess } from "../typechain-types";
import { BigNumber } from "ethers";

async function main() {
  const { deployer } = await hre.getNamedAccounts();

  const guessContract = (await hre.ethers.getContract("Guess", deployer)) as Guess;
  const guessesLength: BigNumber = await guessContract.hashedGuessesLength();
  console.log(`There are ${guessesLength} guesses`);
  if (guessesLength.toNumber() !== 8) {
    console.log("Not enough guesses");
    return;
  }

  // return [[guess, nullifier], myHashedGuess, nullifierHash, merkleRoot,
  // hashedGuesses[0], hashedGuesses[1], hashedGuesses[2], hashedGuesses[3], hashedGuesses[4], hashedGuesses[5], hashedGuesses[6], hashedGuesses[7]];
  const wit = [
    "42000",
    "2222",
    "183506989389562992426801284225335976752",
    "69937380509560656757400495197482346271",
    "41164050820870916183935771838056553770",
    "28115810686032597364107573816858205745",
    "197478980958800774366555030189174383699",
    "333777766013274344080455511007308121981",
    "322284275949787085467534461102361229700",
    "272609851037913931591130280827705522484",
    "194580919278784717483330123023518037636",
    "298328279863815008441779117418513021429",
    "183506989389562992426801284225335976752",
    "69937380509560656757400495197482346271",
    "7202947562795092838710023974615479836",
    "316984577785476087721035476576278682707",
    "9325762516071006258821975897942353338",
    "153108552811387145162254838431984874531",
    "264401628123080272159400479403716831195",
    "236470679062194193824854732379212195205",
    "84874083110904202409633852373739844306",
    "121646750523273077341477253632280357903",
    "334302271610675634393753715228368082914",
    "282678305290068082526217622340446529588",
  ];
  // const witRoot = BigNumber.from(wit[6]) << 128 | BigNumber.from(wit[7]);
  const witRoot = (BigNumber.from(wit[6]).toBigInt() << 128n) | BigNumber.from(wit[7]).toBigInt();
  const witRootN = (BigInt(wit[6]) << 128n) | BigInt(wit[7]);
  console.log(`Wit root is ${witRoot}`);
  console.log(`Wit root is ${witRootN}`);
  // return;

  // field[2] nullifierHash = sha256packed([0, 0, 0, nullifier]); // 128 of 512
  const nullifierHash = hre.ethers.utils.solidityKeccak256(
    ["uint128", "uint128", "uint128", "uint128"],
    [0, 0, 0, 2222],
  );
  console.log(
    `Nullifier hash is ${BigNumber.from(nullifierHash).toString()} vs `,
    (BigInt(wit[4]) << 128n) | BigInt(wit[5]),
  );
  // return;

  // field[2] myHashedGuess = sha256packed([0, nullifier, 0, guess]);
  const myHashedGuess = hre.ethers.utils.solidityKeccak256(
    ["uint128", "uint128", "uint128", "uint128"],
    [0, 2222, 0, 42000],
  );
  // ["uint128", "uint128", "uint128", "uint128"], [0, BigInt(wit[1]), 0, BigInt(wit[0])]);
  // ["uint256", "uint256"], [BigInt(wit[1]), BigInt(wit[0])]);
  console.log(
    `My hashed guess is ${BigNumber.from(myHashedGuess).toString()} vs `,
    (BigInt(wit[2]) << 128n) | BigInt(wit[3]),
  );
  // return;

  const hashedGuesses: BigNumber[] = [];
  let root: string | bigint = 0n;
  for (let i = 0; i < 8; i++) {
    const guesshash = await guessContract.hashedGuesses(i);
    hashedGuesses.push(guesshash);
    // field[2] mut merkleRoot = [0, 0];
    // for u32 i in 0..8 {
    //   merkleRoot = sha256packed([...merkleRoot, ...hashedGuesses[i]]);
    // }
    root = hre.ethers.utils.solidityKeccak256(["uint256", "uint256"], [root, guesshash]);
    root = BigNumber.from(root).toBigInt();
    console.log(`Guess ${i} is ${guesshash}`);
    console.log(`Root is ${root}`);
  }
}

main();
