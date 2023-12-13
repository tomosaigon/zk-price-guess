import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
// import { useAccount } from 'wagmi'
// import { Address as AddressType, createWalletClient, hexToBigInt, http } from "viem";
// import { hexToString, parseEther, formatEther, fromHex } from 'viem'
import { formatEther, fromHex } from 'viem'
// import { Address, AddressInput, Balance, EtherInput, getParsedError } from "~~/components/scaffold-eth";
import { useState } from "react";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const P2222 = {
  "scheme": "g16",
  "curve": "bn128",
  "proof": {
    "a": [
      "0x1504c4318b6154f93e9edea0cf2133f54b1a5b4758c845845bbd30d67cd8de72",
      "0x230114bf4de2b35c7ecb87de13e3a6bd2b282356e5c08c713d486a974fffea51"
    ],
    "b": [
      [
        "0x217e3b26baf1da4e6e4d49836d86ba9855840a7884a1b766242ca3e7b7aec230",
        "0x1112d824bee408d6be442cbd32bebe6287285b771c023118a93d4c9ae5ebf069"
      ],
      [
        "0x2a3c656dcf6267ce06c12e099dfc8af1682d48287dbc178eb88932f2a4b8a405",
        "0x24e3fa05cf1fef2365b86030bd2a02b1b3b504bb4030c767fbcd1931209622ea"
      ]
    ],
    "c": [
      "0x16e3db2f1298ed70997e964c7d2747411ee3eaf72f2677caa1794ef00e5ec610",
      "0x1c540cf1b24f256598085b5742aa74c4aa669d4080b125a56ed048b56e78f5e2"
    ]
  },
  "inputs": [
    "0x0000000000000000000000000000000000000000000008e4d316827686400000",
    "0x000000000000000000000000000000001ef7e8664a33f754acb960556128dd2a",
    "0x000000000000000000000000000000001526e87de6a167b7efff870982475e31",
    "0x00000000000000000000000000000000e6403178da849ec42f030f92d9c3f081",
    "0x0000000000000000000000000000000099d15d4263f91abfefb2c6e53626b9f0"
  ]
}
function proofFromJson(p: any) {
  return {
    a: { X: fromHex(p.a[0], "bigint"), Y: fromHex(p.a[1], "bigint")},
    b: {
      X: [fromHex(p.b[0][0], "bigint"), fromHex(p.b[0][1], "bigint")] as readonly [bigint, bigint],
      Y: [fromHex(p.b[1][0], "bigint"), fromHex(p.b[1][1], "bigint")] as readonly [bigint, bigint]
    },
    c: { X: fromHex(p.c[0], "bigint"), Y: fromHex(p.c[1], "bigint")},
  }
}

// const [inputAddress, setInputAddress] = useState<AddressType>();
// const { address, isConnecting, isDisconnected } = useAccount();

const Home: NextPage = () => {
  // hashes!
  const [hashedGuess1, setHashedGuess1] = useState('');
  const [hashedGuess2, setHashedGuess2] = useState('');
  const [proof, setProof] = useState('');
  const [guess, setGuess] = useState('');
  const [nullifierHash1, setNullifierHash1] = useState('');
  const [nullifierHash2, setNullifierHash2] = useState('');
  const [hashedGuessesRoot1, setHashedGuessesRoot1] = useState('');
  const [hashedGuessesRoot2, setHashedGuessesRoot2] = useState('');



  const { data: hashedGuesses, isLoading: isLoadingHashedGuesses } = useScaffoldContractRead({
    contractName: "Guess",
    functionName: "getHashedGuesses",
  });
  // const { data: btcPrice, isLoading: isLoadingSettledBTCPrice } = useScaffoldContractRead({
  //   contractName: "MockPriceContract",
  //   functionName: "btcPrice",
  // });
  const { data: currentBestGuess, isLoading: isLoadingCurrentBestGuess } = useScaffoldContractRead({
    contractName: "Guess",
    functionName: "currentBestGuess",
  });
  const { data: guessingIsAllowed, isLoading: isLoadingGuessingIsAllowed } = useScaffoldContractRead({
    contractName: "Guess",
    functionName: "guessingIsAllowed",
  });
  const { data: btcPrice, isLoading: isLoadingBtcPrice } = useScaffoldContractRead({
    contractName: "Guess",
    functionName: "btcPrice",
  });
  const { data: btcPriceSet, isLoading: isLoadingBtcPriceSet } = useScaffoldContractRead({
    contractName: "Guess",
    functionName: "btcPriceSet",
  });
  const { data: updateBestIsAllowed, isLoading: isLoadingUpdateBestIsAllowed } = useScaffoldContractRead({
    contractName: "Guess",
    functionName: "updateBestIsAllowed",
  });
  const { writeAsync: writeAsyncCommitGuess, isLoading: isCommittingGuess } = useScaffoldContractWrite({
    contractName: "Guess",
    functionName: 'commitGuess',
    args: [
      BigInt(hashedGuess1),
      BigInt(hashedGuess2,)
    ],
    onBlockConfirmation: (txnReceipt: any) => {
      console.log("commitGuess blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: writeAsyncCloseGuessing, isLoading: isClosingGuessing } = useScaffoldContractWrite({
    contractName: "Guess",
    functionName: 'closeGuessingAndResolvePrice',
    onBlockConfirmation: (txnReceipt: any) => {
      console.log("closeGuessingAndResolvePrice blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: writeAsyncUpdateBestGuess, isLoading: isUpdatingBestGuess } = useScaffoldContractWrite({
    contractName: "Guess",
    functionName: 'updateBest',
    args: [
      proofFromJson(P2222.proof),
      fromHex(guess as `0x${string}`, "bigint"),
      fromHex(nullifierHash1 as `0x${string}`, "bigint"),
      fromHex(nullifierHash2 as `0x${string}`, "bigint"),
      fromHex(hashedGuessesRoot1 as `0x${string}`, "bigint"),
      fromHex(hashedGuessesRoot2 as `0x${string}`, "bigint")
    ],
    onBlockConfirmation: (txnReceipt: any) => {
      console.log("updateBest blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: writeAsyncFinalize, isLoading: isFinalizing } = useScaffoldContractWrite({
    contractName: "Guess",
    functionName: 'finalize',
    onBlockConfirmation: (txnReceipt: any) => {
      console.log("finalize blockHash", txnReceipt.blockHash);
    },
  });

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        {/* Render content for state where guessing is allowed */}
        {guessingIsAllowed && (
          <div className="px-5">
            {/* table of hashed guesses */}
            <table>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Hashed Guess</th>
                </tr>
              </thead>
              <tbody>
                {hashedGuesses &&
                  hashedGuesses.map((hashedGuess, index) => (
                    <tr key={index}>
                      <td>{index}</td>
                      <td>{hashedGuess.toString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Form for committing guesses */}
            <div>
              <label htmlFor="hashedGuess1">Hashed Guess 1:</label>
              <input
                type="text"
                id="hashedGuess1"
                value={hashedGuess1}
                onChange={(e) => setHashedGuess1(e.target.value)}
              />

              <label htmlFor="hashedGuess2">Hashed Guess 2:</label>
              <input
                type="text"
                id="hashedGuess2"
                value={hashedGuess2}
                onChange={(e) => setHashedGuess2(e.target.value)}
              />

              <button onClick={(e) => {
                writeAsyncCommitGuess();
                e.preventDefault();
              }}>Commit Guess</button>
            </div>



            <button onClick={(e) => {
              writeAsyncCloseGuessing();
              e.preventDefault();
            }}>Close Guessing and Resolve Price</button>
          </div>
        )}

        {/* {updateBestIsAllowed } */}
        {updateBestIsAllowed && (
          <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
            {/* Show settled BTC price, current best guess, and form for updating best guess */}
            <div>
              <p>Settled BTC Price: {btcPrice ? formatEther(btcPrice) : ''}</p>
              <p>Current Best Guess: {currentBestGuess ? formatEther(currentBestGuess) : ''}</p>
            </div>


            {/* Form for updating the best guess */}
            <div>
              <label htmlFor="proof">Proof:</label>
              <input
                type="text"
                id="proof"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
              />

              <label htmlFor="guess">Guess:</label>
              <input
                type="text"
                id="guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
              />

              <label htmlFor="nullifierHash1">Nullifier Hash 1:</label>
              <input
                type="text"
                id="nullifierHash1"
                value={nullifierHash1}
                onChange={(e) => setNullifierHash1(e.target.value)}
              />

              <label htmlFor="nullifierHash2">Nullifier Hash 2:</label>
              <input
                type="text"
                id="nullifierHash2"
                value={nullifierHash2}
                onChange={(e) => setNullifierHash2(e.target.value)}
              />

              <label htmlFor="hashedGuessesRoot1">Hashed Guesses Root 1:</label>
              <input
                type="text"
                id="hashedGuessesRoot1"
                value={hashedGuessesRoot1}
                onChange={(e) => setHashedGuessesRoot1(e.target.value)}
              />

              <label htmlFor="hashedGuessesRoot2">Hashed Guesses Root 2:</label>
              <input
                type="text"
                id="hashedGuessesRoot2"
                value={hashedGuessesRoot2}
                onChange={(e) => setHashedGuessesRoot2(e.target.value)}
              />

              <button onClick={(e) => {
                writeAsyncUpdateBestGuess();
                e.preventDefault();
              }}>Update Best Guess</button>
            </div>
            <button onClick={(e) => {
              writeAsyncFinalize();
              e.preventDefault();
            }}>Finalize</button>
          </div>
        )}

        {/* TODO Always show the balance of ether in Guess contract and the ticket price */}
      </div >
    </>
  );
};

export default Home;
