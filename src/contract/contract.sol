// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import {IERC20} from "@thirdweb-dev/contracts/eip/interface/IERC20.sol";
import {Ownable} from "@thirdweb-dev/contracts/extension/Ownable.sol";
import {ReentrancyGuard} from "@thirdweb-dev/contracts/external-deps/openzeppelin/security/ReentrancyGuard.sol";

contract krakenMarket is Ownable, ReentrancyGuard {

    enum MarketOutcome {
        UNRESOLVED,
        OPTION_A,
        OPTION_B,
        OPTION_C,
        OPTION_D
    }

    event MarketCreated(
        uint256 indexed marketId,
        string question,
        string optionA,
        string optionB,
        string optionC,
        string optionD,
        uint256 endTime

    );

    event SharesPurchasedOptionA(
        uint256 indexed marketId,
        address indexed buyer,
        bool isOptionA,
        uint256 amount
    );

     event SharesPurchasedOptionB(
        uint256 indexed marketId,
        address indexed buyer,
        bool isOptionB,
        uint256 amount
    );

     event SharesPurchasedOptionC(
        uint256 indexed marketId,
        address indexed buyer,
        bool isOptionC,
        uint256 amount
    );

     event SharesPurchasedOptionD(
        uint256 indexed marketId,
        address indexed buyer,
        bool isOptionD,
        uint256 amount
    );
    

    
    event MarketResolved(uint256 indexed markedId,MarketOutcome outcome);

    event Claimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    
    struct Market {
        string question;
        uint256 endTime;
        MarketOutcome outcome;
        string optionA;
        string optionB;
        string optionC;
        string optionD;
        uint256 totalOptionAShares;
        uint256 totalOptionBShares;
        uint256 totalOptionCShares;
        uint256 totalOptionDShares;
        bool resolved;
        mapping(address =>uint256) optionASharesBalance;
        mapping(address =>uint256) optionBSharesBalance;
        mapping(address =>uint256) optionCSharesBalance;
        mapping(address =>uint256) optionDSharesBalance;

        mapping(address => bool) hasClaimed;
    }

    IERC20 public bettingToken;
    uint256 public marketCount;
    mapping(uint256 => Market) public markets;

    function _canSetOwner() internal view virtual override returns(bool) {
        return msg.sender == owner();
        
    }

    constructor(address _bettingToken) {

        bettingToken = IERC20(_bettingToken);
        _setupOwner(msg.sender);
    }

    function createMarket(
        string memory _question,
        string memory _optionA,
        string memory _optionB,
        string memory _optionC,
        string memory _optionD,
        uint256 _duration
    ) external returns (uint256) {

        require(msg.sender ==owner(),"Only woner can create");
        require(_duration >0,"Duration must be positive");
        require(
            bytes(_optionA).length >0 && bytes(_optionB).length >0 && bytes(_optionC).length>0 && bytes(_optionD).length>0,"Option cannot be empty"
        );

        uint256 marketId = marketCount++;
        Market storage market = markets[marketId];

        market.question=_question;
        market.optionA= _optionA;
        market.optionB = _optionB;
        market.optionC = _optionC;
        market.optionD = _optionD;
        market.endTime = block.timestamp + _duration;
        market.outcome= MarketOutcome.UNRESOLVED;

        emit MarketCreated(marketId, _question, _optionA, _optionB, _optionC, _optionD, market.endTime);
        return marketId;

    }

    function buyShares(
        uint256 _marketId,
        bool _isOptionA,
        bool _isOptionB,
        bool _isOptionC,
        bool _isOptionD,
        uint _amount
    ) external {

        Market storage market= markets[_marketId];
        require(block.timestamp < market.endTime,"Market trading period has ended");
        require(!market.resolved,"Market already resolved");
        require(_amount>0 ,"Amount must be +ve");

        require(bettingToken.transferFrom(msg.sender, address(this), _amount),"Token tranfer failed");

        if(_isOptionA) {
            market.optionASharesBalance[msg.sender]+=_amount;
            market.totalOptionAShares+=_amount;
            emit SharesPurchasedOptionA(_marketId, msg.sender, _isOptionA, _amount);
        }
        if(_isOptionB) {
            market.optionBSharesBalance[msg.sender]+=_amount;
            market.totalOptionBShares+=_amount;
            emit SharesPurchasedOptionB(_marketId, msg.sender, _isOptionB, _amount);
        }
        if(_isOptionC) {
            market.optionCSharesBalance[msg.sender]+=_amount;
            market.totalOptionCShares+=_amount;
            emit SharesPurchasedOptionC(_marketId, msg.sender, _isOptionC, _amount);
        }
        else{
            market.optionDSharesBalance[msg.sender]+=_amount;
            market.totalOptionDShares+=_amount;
            emit SharesPurchasedOptionD(_marketId, msg.sender, _isOptionD, _amount);

        }
        
    }

    function resolveMarket(uint256 _marketId) external {
    require(msg.sender == owner(), "Only owner can resolve market");

    Market storage market = markets[_marketId];
    require(block.timestamp >= market.endTime, "Market hasn't ended yet");
    require(!market.resolved, "Market already resolved");

    // Get total shares
    uint256 a = market.totalOptionAShares;
    uint256 b = market.totalOptionBShares;
    uint256 c = market.totalOptionCShares;
    uint256 d = market.totalOptionDShares;

    // Find the least value among them
    uint256 min = a;
    MarketOutcome outcome = MarketOutcome.OPTION_A;

    if (b < min) {
        min = b;
        outcome = MarketOutcome.OPTION_B;
    }
    if (c < min) {
        min = c;
        outcome = MarketOutcome.OPTION_C;
    }
    if (d < min) {
        min = d;
        outcome = MarketOutcome.OPTION_D;
    }

    market.outcome = outcome;
    market.resolved = true;

    emit MarketResolved(_marketId, outcome);
}


    function claimWinning(uint256 _marketId) external {
    Market storage market = markets[_marketId];
    require(market.resolved, "Market not resolved yet");
    require(!market.hasClaimed[msg.sender], "Already claimed");

    uint256 userShares;
    uint256 winningShares;
    uint256 totalLosingShares;

    // Handle based on resolved outcome
    if (market.outcome == MarketOutcome.OPTION_A) {
        userShares = market.optionASharesBalance[msg.sender];
        winningShares = market.totalOptionAShares;
        totalLosingShares = market.totalOptionBShares + market.totalOptionCShares + market.totalOptionDShares;
        market.optionASharesBalance[msg.sender] = 0;
    } else if (market.outcome == MarketOutcome.OPTION_B) {
        userShares = market.optionBSharesBalance[msg.sender];
        winningShares = market.totalOptionBShares;
        totalLosingShares = market.totalOptionAShares + market.totalOptionCShares + market.totalOptionDShares;
        market.optionBSharesBalance[msg.sender] = 0;
    } else if (market.outcome == MarketOutcome.OPTION_C) {
        userShares = market.optionCSharesBalance[msg.sender];
        winningShares = market.totalOptionCShares;
        totalLosingShares = market.totalOptionAShares + market.totalOptionBShares + market.totalOptionDShares;
        market.optionCSharesBalance[msg.sender] = 0;
    } else if (market.outcome == MarketOutcome.OPTION_D) {
        userShares = market.optionDSharesBalance[msg.sender];
        winningShares = market.totalOptionDShares;
        totalLosingShares = market.totalOptionAShares + market.totalOptionBShares + market.totalOptionCShares;
        market.optionDSharesBalance[msg.sender] = 0;
    } else {
        revert("Invalid market outcome");
    }

    require(userShares > 0, "No winnings to claim");

    // Reward = user original + proportional share of losing pool
    uint256 rewardRatio = (totalLosingShares * 1e18) / winningShares;
    uint256 reward = userShares + (userShares * rewardRatio) / 1e18;

    require(bettingToken.transfer(msg.sender, reward), "Transfer failed");
    market.hasClaimed[msg.sender] = true;

    emit Claimed(_marketId, msg.sender, reward);
}


    function getMarketInfo(
        uint256 _marketId
    ) external view returns (
        string memory question,
        string memory optionA,
        string memory optionB,
        string memory optionC,
        string memory optionD,
        uint256 endTime,
        MarketOutcome outcome,
        uint256 totalOptionAShares,
        uint256 totalOptionBShares,
        uint256 totalOptionCShares,
        uint256 totalOptionDShares,
        bool resolved
    )
    {
        Market storage market = markets[_marketId];
        return(
            market.question,
            market.optionA,
            market.optionB,
            market.optionC,
            market.optionD,
            market.endTime,
            market.outcome,
            market.totalOptionAShares,
            market.totalOptionBShares,
            market.totalOptionCShares,
            market.totalOptionDShares,
            market.resolved
        );
    }

    function getSharesBalance(
        uint256 _marketId,
        address _user
    ) external view returns(uint256 optionAShares,uint256 optionBShares,uint256 optionCShares,uint256 optionDShares) {
        Market storage market = markets[_marketId];
        return (
            market.optionASharesBalance[_user],
            market.optionBSharesBalance[_user],
            market.optionCSharesBalance[_user],
            market.optionDSharesBalance[_user]
        );
    }
    function getblocktimestamp() external view returns (uint256) {
        return block.timestamp;
    }
}