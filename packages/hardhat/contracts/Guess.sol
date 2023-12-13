// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

struct G1Point {
	uint X;
	uint Y;
}
// Encoding of field elements is: X[0] * z + X[1]
struct G2Point {
	uint[2] X;
	uint[2] Y;
}
struct Proof {
	G1Point a;
	G2Point b;
	G1Point c;
}

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

	function hashedGuessesLength() public view returns (uint) {
		return hashedGuesses.length;
	}

	function closeGuessingAndResolvePrice() public guessingAllowed {
		guessingIsAllowed = false;

		IPriceContract(priceContract).setBtcPrice();

		btcPrice = IPriceContract(priceContract).btcPrice();
		btcPriceSet = true;
	}

	function commitGuess(
		uint hashedGuess1,
		uint hashedGuess2
	) public payable guessingAllowed {
		// require(msg.value >= ticketPrice, "Insufficient funds");

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
	function updateBest(
		Proof memory proof,
		uint guessValue,
		uint nullifierHash1,
		uint nullifierHash2,
		uint hashedGuessesRoot1,
		uint hashedGuessesRoot2
	) public guessingNotAllowed {
		if (!btcPriceSet) {
			closeGuessingAndResolvePrice();
		}

		// Verify the proof using the VerifierContract's verifyTX function
		require(
			IVerifierContract(verifierContract).verifyTX(
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

interface IVerifierContract {
	function verifyTX(
		Proof memory proof,
		uint[5] memory inputs
	) external returns (bool);
}

interface IPriceContract {
	function setBtcPrice() external;

	function btcPrice() external view returns (uint256);
}
