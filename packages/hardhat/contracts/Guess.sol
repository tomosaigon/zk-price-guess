// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Guess {
	address public owner;
	uint public ticketPrice;
	address public verifierContract;
	address public priceContract;

	uint public btcPrice;
	bool public btcPriceSet;

	uint[] public hashedGuesses;
	uint public guessesRoot;

	bool public guessingIsAllowed = true;
	bool public updateBestIsAllowed = true;

	uint public currentBestGuess;
	address[] public currentBestGuessers;

	mapping(uint => bool) public nullifiers;

	mapping(address => uint) public lastGuessBySender;

	modifier guessingAllowed() {
		require(guessingIsAllowed, "Guessing is not allowed");
		_;
	}
	modifier guessingNotAllowed() {
		require(!guessingIsAllowed, "Guessing is still allowed");
		_;
	}

	constructor(
		uint _ticketPrice,
		address _verifierContract,
		address _priceContract
	) {
		owner = msg.sender;
		ticketPrice = _ticketPrice;
		verifierContract = _verifierContract;
		priceContract = _priceContract;
	}

	function getHashedGuesses() public view returns (uint[] memory) {
		return hashedGuesses;
	}

	function hashedGuessesLength() public view returns (uint) {
		return hashedGuesses.length;
	}

	function getCurrentBestGuessers() public view returns (address[] memory) {
		return currentBestGuessers;
	}

	function currentBestGuessersLength() public view returns (uint) {
		return currentBestGuessers.length;
	}

	function winnersLength() public view returns (uint) {
		return updateBestIsAllowed ? 0 : currentBestGuessers.length;
	}

	function closeGuessingAndResolvePrice() public guessingAllowed {
		guessingIsAllowed = false;

		IPriceContract(priceContract).setBtcPrice();

		btcPrice = IPriceContract(priceContract).btcPrice();
		btcPriceSet = true;
	}

	function finalize() public guessingNotAllowed {
		require(updateBestIsAllowed, "Already finalized");
		updateBestIsAllowed = false;

		uint256 totalEther = address(this).balance;
		require(totalEther > 0, "No Ether to distribute");

		uint256 numberOfGuessers = currentBestGuessers.length;
		// require(numberOfGuessers > 0, "No addresses to distribute to");

		uint256 amountPerAddress = totalEther / numberOfGuessers;

		for (uint256 i = 0; i < numberOfGuessers; i++) {
			address payable guesser = payable(currentBestGuessers[i]);
			guesser.transfer(amountPerAddress);
		}
	}

	function commitGuess(
		uint hashedGuess1,
		uint hashedGuess2
	) public payable guessingAllowed {
		require(msg.value >= ticketPrice, "Insufficient funds");

		uint hashedGuess = uint(
			(uint128(hashedGuess1) << 128) | uint128(hashedGuess2)
		);
		hashedGuesses.push(hashedGuess);

		lastGuessBySender[msg.sender] = hashedGuesses.length - 1;
	}

	function commitGuessesRoot(uint root) public guessingNotAllowed {
		// TODO calc from hashedGuesses
		guessesRoot = root;
	}

	// main(
	//   public field guess,
	//   private field nullifier,
	//   private field[2] myHashedGuessTEST, // make test consistent
	//   public field[2] nullifierHash,
	//   public field[2] committedRoot,
	//   private field[8][2] hashedGuesses)
	// XXX fails
	function check(
		IVerifier.Proof memory proof,
		uint[5] memory inputs
	) public view returns (bool) {
		// Verify the proof using the VerifierContract's verifyTx function
		return IVerifier(verifierContract).verifyTx(proof, inputs);
	}

	function checkStatic() public view returns (bool) {
		// Proof 2 is  [["0x1504c4318b6154f93e9edea0cf2133f54b1a5b4758c845845bbd30d67cd8de72","0x230114bf4de2b35c7ecb87de13e3a6bd2b282356e5c08c713d486a974fffea51"],[["0x217e3b26baf1da4e6e4d49836d86ba9855840a7884a1b766242ca3e7b7aec230","0x1112d824bee408d6be442cbd32bebe6287285b771c023118a93d4c9ae5ebf069"],["0x2a3c656dcf6267ce06c12e099dfc8af1682d48287dbc178eb88932f2a4b8a405","0x24e3fa05cf1fef2365b86030bd2a02b1b3b504bb4030c767fbcd1931209622ea"]],["0x16e3db2f1298ed70997e964c7d2747411ee3eaf72f2677caa1794ef00e5ec610","0x1c540cf1b24f256598085b5742aa74c4aa669d4080b125a56ed048b56e78f5e2"]]
		IVerifier.Proof memory proof = IVerifier.Proof(
			IPairing.G1Point(
				0x1504c4318b6154f93e9edea0cf2133f54b1a5b4758c845845bbd30d67cd8de72,
				0x230114bf4de2b35c7ecb87de13e3a6bd2b282356e5c08c713d486a974fffea51
			),
			IPairing.G2Point(
				[
					0x217e3b26baf1da4e6e4d49836d86ba9855840a7884a1b766242ca3e7b7aec230,
					0x1112d824bee408d6be442cbd32bebe6287285b771c023118a93d4c9ae5ebf069
				],
				[
					0x2a3c656dcf6267ce06c12e099dfc8af1682d48287dbc178eb88932f2a4b8a405,
					0x24e3fa05cf1fef2365b86030bd2a02b1b3b504bb4030c767fbcd1931209622ea
				]
			),
			IPairing.G1Point(
				0x16e3db2f1298ed70997e964c7d2747411ee3eaf72f2677caa1794ef00e5ec610,
				0x1c540cf1b24f256598085b5742aa74c4aa669d4080b125a56ed048b56e78f5e2
			)
		);
		// Inputs 2 are  ["0x08e4d316827686400000","0x1ef7e8664a33f754acb960556128dd2a","0x1526e87de6a167b7efff870982475e31","0xe6403178da849ec42f030f92d9c3f081","0x99d15d4263f91abfefb2c6e53626b9f0"]
		uint[5] memory inputValues = [
			uint256(0x08e4d316827686400000),
			0x1ef7e8664a33f754acb960556128dd2a,
			0x1526e87de6a167b7efff870982475e31,
			0xe6403178da849ec42f030f92d9c3f081,
			0x99d15d4263f91abfefb2c6e53626b9f0
		];
		return IVerifier(verifierContract).verifyTx(proof, inputValues);
	}

	function updateBest(
		IVerifier.Proof memory proof,
		uint guessValue,
		uint nullifierHash1,
		uint nullifierHash2,
		uint hashedGuessesRoot1,
		uint hashedGuessesRoot2
	) public guessingNotAllowed {
		if (!btcPriceSet) {
			closeGuessingAndResolvePrice();
		}

		// Verify the proof using the VerifierContract's verifyTx function
		require(
			IVerifier(verifierContract).verifyTx(
				proof,
				[
					guessValue,
					nullifierHash1,
					nullifierHash2,
					hashedGuessesRoot1,
					hashedGuessesRoot2
				]
			),
			"Proof verification failed"
		);

		// Proof root matches commitment
		// TODO zokrates vs solidity
		// require(
		// 	uint(
		// 		(uint128(hashedGuessesRoot1) << 128) |
		// 			uint128(hashedGuessesRoot2)
		// 	) == guessesRoot,
		// 	"Roots do not match"
		// );

		uint nullifier = uint(
			(uint128(nullifierHash1) << 128) | uint128(nullifierHash2)
		);
		require(!nullifiers[nullifier], "Nullifier already used");
		nullifiers[nullifier] = true;

		uint guessDiff = guessValue > btcPrice
			? guessValue - btcPrice
			: btcPrice - guessValue;
		uint currentBestGuessDiff = currentBestGuess > btcPrice
			? currentBestGuess - btcPrice
			: btcPrice - currentBestGuess;

		// Check if the guess is closer to the BTC price than the current best guess
		if (guessDiff < currentBestGuessDiff) {
			// Update current best guess and reset array
			currentBestGuess = guessValue;
			delete currentBestGuessers;
			currentBestGuessers.push(msg.sender);
		} else if (guessDiff == currentBestGuessDiff) {
			currentBestGuessers.push(msg.sender);
		}
	}
}

interface IPairing {
	struct G1Point {
		uint X;
		uint Y;
	}
	// Encoding of field elements is: X[0] * z + X[1]
	struct G2Point {
		uint[2] X;
		uint[2] Y;
	}
}

interface IVerifier {
	struct Proof {
		IPairing.G1Point a;
		IPairing.G2Point b;
		IPairing.G1Point c;
	}

	function verifyTx(
		Proof memory proof,
		uint[5] memory inputs
	) external view returns (bool);
}

interface IPriceContract {
	function setBtcPrice() external;

	function btcPrice() external view returns (uint256);
}
