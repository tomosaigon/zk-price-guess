#!/bin/sh

set -e

zokrates compile -i hash.zok

zokrates setup

for i in 0 1 2 3 4 5 6 7; do
  nullifier="$i$i$i$i"
  if [ $i -eq 0 ]; then
    nullifier="0"
  fi
  guess="4${i}000"
  guess18="${guess}000000000000000000"
  echo $guess18
  echo zokrates compute-witness -a $guess18 $nullifier --verbose 
  # zokrates compute-witness -a $guess $nullifier --verbose | grep '^\[' | cut -d',' -f3-4 > hash_${nullifier}_${guess}
  zokrates compute-witness -a $guess18 $nullifier --verbose | grep '^\[' > witness_${nullifier}_${guess}.json
  cat witness_${nullifier}_${guess}.json | cut -d',' -f3-4 > hash_${nullifier}_${guess}
  cat witness_${nullifier}_${guess}.json | cut -d',' -f5-7 > nullifierHash${nullifier}
  cat witness_${nullifier}_${guess}.json
done
cat hash_*
# exit

# nullifier="2222"
# guess="42000"
# zokrates compute-witness -a $guess $nullifier --verbose | grep '^\[' > witness.json
# cat witness.json

zokrates generate-proof

zokrates verify

#### guessinhashes

zokrates compile -i guessinhashes.zok

zokrates setup

for i in 0 1 2 3 4 5 6 7; do
  nullifier="$i$i$i$i"
  if [ $i -eq 0 ]; then
    nullifier="0"
  fi
  guess="4${i}000"
  guess18="${guess}000000000000000000"

  # zokrates compute-witness -a $(cat witness.json|tr -d '"[]'|tr ',' ' ') --verbose 
  zokrates compute-witness -a $(cat witness_${nullifier}_${guess}.json|tr -d '"[]'|tr ',' ' ') --verbose 

  zokrates generate-proof
  cp proof.json proof_${nullifier}_${guess}.json
done

zokrates export-verifier

mv verifier.sol ../contracts/Verifier.sol