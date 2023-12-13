import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { promises as fs } from "fs";
import hre from "hardhat";
import { Guess } from "../typechain-types";

async function findFiles(pattern: string): Promise<string[]> {
  const directory = "../zokrates";
  const files = await fs.readdir(directory);
  // console.log(`Files in ${directory}: ${files}`);
  return files.filter(file => file.startsWith(pattern)).map(file => directory + "/" + file);
}

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  // Get 8 accounts
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();

  const guessContract = (await hre.ethers.getContract("Guess", deployer)) as Guess;
  const guessingIsAllowed = await guessContract.guessingIsAllowed();
  if (!guessingIsAllowed) {
    console.log("Guessing is not allowed");
    return;
  }

  for (let i = 0; i < 8; i++) {
    const files = await findFiles(`hash_${i}`);
    if (files.length !== 1) {
      throw new Error(`Expected 1 file for account ${i}, but found ${files.length}`);
    }
    const filename = files[0];
    const fileContent = await fs.readFile(filename, "utf-8");
    // console.log(fileContent.trim().replace(/"/g, ''));
    const [myHashedGuess1, myHashedGuess2] = fileContent.trim().replace(/"/g, "").split(",").map(BigInt);

    const guessContract = (await hre.ethers.getContract("Guess", signers[i])) as Guess;
    console.log(
      `Account ${i} is ${signers[i].address}, guess is ${myHashedGuess1.toString()}, ${myHashedGuess2.toString()}}`,
    );
    const tx = await guessContract.commitGuess(myHashedGuess1, myHashedGuess2, {
      value: hre.ethers.utils.parseEther("0.01"),
    });
    await tx.wait();
  }

  const guessesLength = await guessContract.hashedGuessesLength();
  console.log(`There are ${guessesLength} guesses`);
}

main();
