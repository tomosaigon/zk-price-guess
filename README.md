# Zero Knowledge Bitcoin Price Lottery

Deploy: https://zk-price-guess.vercel.app 

Zero Knowledge Bitcoin Price Lottery is a novel game of skill that rewards the closest guess of a future Bitcoin price while hiding guesses made during the contest and shielding the account(s) who win the prize from everyone's ticket sales. The price is resolved using the Tellor Oracle and there is no DAO needed for anything. Anyone can deploy a contest.

The game uses ZoKrates to create proofs which convince a verifier contract that a player knows the preimage of a nullifier hash (to keep proofs unique) that was used with a guess that was in one of (succinct via private Merkle witness) the committed but hashed guesses made before guessing finished. This doesn't reveal which hash and therefore maintains privacy for whoever originally played that price. Any account can submit the zero knowledge proof and claim the winnings. The winner is chosen by a ratcheting game of contestants who had better guesses submitting their proofs until nobody can submit a better proof.

All collected ticket sales (in ether) are split, if multiple winners choose the same price, otherwise the full amount held in contract is sent to the winner in the finalization transaction.

The contract uses Tellor to resolve a Bitcoin price when concluding the guessing period.

Proofs must be generated by the players themselves and submitted to the on chain verifier.

In the hardhat repo (in the monorepo), compile the ZoKrates circuits by running `setup.sh` or generate 8 different price guesses with deterministic (for debugging) nullifiers and the needed hashes, witness, and proof, all by running the `hashNtest.sh` script. Both are in `zokrates/scripts` inside hardhat where they should be run from.

ParseProof is a helper script to convert a `proof.json` into a format easier to use as contract input.

Deploy the Verifier, Guess, and PriceContract (or Mock) then run the NextJS frontend with `yarn start`.

# Next steps

Next steps: Layer 2 lottery sequencers who open a state channel with players who submit guesses and submit proofs off chain, then roll up all guesses in one transaction that succinctly commits a Merkle root. Players then challenge each other to be the winner, off chain, with the final winner sent from the L2 to L1 as a single proof transaction.
