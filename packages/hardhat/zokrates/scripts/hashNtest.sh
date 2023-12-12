#!/bin/sh

set -e

#### hash

zokrates compile -i hash.zok

zokrates setup

nullifier="2222"
guess="42000"

zokrates compute-witness -a $guess $nullifier --verbose | grep '^\[' > witness.json
cat witness.json

zokrates generate-proof

zokrates verify

#### guessinhashes

zokrates compile -i guessinhashes.zok

zokrates setup

zokrates compute-witness -a $(cat witness.json|tr -d '"[]'|tr ',' ' ') --verbose 

zokrates generate-proof

#zokrates export-verifier

#mv verifier.sol ../contracts/Verifier.sol