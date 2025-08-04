# Kraken Prediction Markets - Technical Architecture

## Overview

Kraken is a decentralized prediction market platform built on Etherlink (Tezos Layer 2) that implements an innovative "underdog wins" mechanism. Unlike traditional prediction markets where the most popular option wins, Kraken rewards the option with the **fewest shares** when the market closes, creating unique strategic gameplay.

## Architecture Components

### 1. Blockchain Infrastructure

**Network**: Etherlink Testnet (Layer 2 on Tezos)
- **Chain ID**: 128123
- **RPC URL**: https://node.ghostnet.etherlink.com
- **Block Explorer**: https://testnet.explorer.etherlink.com
- **Native Currency**: XTZ

**Smart Contracts**:
- **Prediction Market Contract**: `0xD348da1883f9674a39A04DDe776B1C5173bCB771`
- **USDC Token Contract**: `0xf298Ec2ea2FA1F41E5Fb7b5aE805773A05D88507`

### 2. Smart Contract Architecture

#### Core Contract: `UnPredictionMarket`

**Key Features**:
- Multiple-choice markets (4 options: A, B, C, D)
- ERC20 token-based betting (USDC)
- Automatic resolution based on minimum shares
- Instant on-chain settlement
- Owner-controlled market creation

**Main Functions**:
```solidity
// Market Creation
createMarket(string question, string optionA, string optionB, string optionC, string optionD, uint256 duration)

// Betting
buyShares(uint256 marketId, bool isOptionA, bool isOptionB, bool isOptionC, bool isOptionD, uint256 amount)

// Resolution
resolveMarket(uint256 marketId)

// Information Retrieval
getMarketInfo(uint256 marketId) returns (full market data)
```

**Market Resolution Logic**:
The winning option is determined by the option with the **fewest total shares** when the market expires, creating the unique "underdog wins" mechanic.

### 3. Frontend Architecture

#### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3 Integration**: Ethers.js v6
- **Wallet Connection**: MetaMask 
- **State Management**: React Context API
- **Notifications**: React Hot Toast
- **Database**: Supabase (for comments system)

#### Key Components

**Web3 Context (`/src/lib/Web3Context.tsx`)**:
- Manages wallet connection state
- Handles network switching
- Provides contract instances
- Owner role verification

**Pages Structure**:
```
/                    - Landing page with feature showcase
/market             - Market listing and discovery
/market/[id]        - Individual market detail and betting
/dashboard          - User positions and claimable winnings
/admin              - Market creation and resolution (owner only)
```

#### State Management
- **Web3 State**: Wallet connection, network status, contract instances
- **UI State**: Loading states, form data, user balances
- **Market State**: Market data, user positions, betting interface

### 4. Database Architecture (Supabase)


**Features**:
- Market-specific discussions
- Wallet-based authentication
- Character limits and validation
- Automatic timestamps

### 5. User Experience Flow

#### 1. Wallet Connection
- MetaMask integration with automatic network detection
- Automatic network switching to Etherlink Testnet
- Persistent connection state across sessions

#### 2. Market Discovery
- Grid view of all active/resolved markets
- Status badges (Active, Expired, Resolved)
- Quick market information preview

#### 3. Betting Process
```
1. Connect Wallet → 2. Browse Markets → 3. Place Bet → 4. Await Resolution → 5. Claim Rewards
```

#### 4. USDC Integration
- Test USDC minting for development
- ERC20 approval workflow
- Balance and allowance tracking
- Automatic balance updates

### 6. Security Features

#### Smart Contract Security
- Owner-controlled market creation
- Input validation for market parameters
- Safe ERC20 token transfers
- Automatic market expiration

#### Frontend Security
- Wallet address validation (regex: `^0x[a-fA-F0-9]{40}$`)
- Input sanitization for comments
- Transaction confirmation dialogs
- Error handling and user feedback

#### Network Security
- Network validation before transactions
- Automatic network switching
- Circuit breaker error handling with retries

### 7. Development Features

#### Transaction Management
- Enhanced transaction wrapper with retry logic
- MetaMask connectivity issue handling
- User-friendly error messages
- Loading states and confirmations

#### Testing Tools
- Test USDC minting functionality
- Local development environment support
- Comprehensive error logging

### 8. Deployment Architecture

#### Frontend Deployment
- Next.js static export capability
- Environment-based configuration
- Responsive design for mobile/desktop

#### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 9. Data Flow

#### Market Creation Flow
```
Admin UI → Web3Context → Smart Contract → Blockchain → State Update → UI Refresh
```

#### Betting Flow
```
Market UI → USDC Approval → Buy Shares Transaction → Blockchain → Balance Update → Position Tracking
```

#### Resolution Flow
```
Market Expiry → Admin Resolution → Smart Contract Logic → Winner Determination → Claimable Rewards
```

### 10. Key Innovations

#### Underdog Mechanism
- Rewards the option with fewest shares (not most popular)
- Creates strategic depth and prevents herd mentality
- Encourages contrarian thinking and analysis

#### Instant Resolution
- No external oracles required
- Trustless, on-chain resolution
- Immediate settlement after market closes

#### User Experience

- Real-time balance and allowance tracking
- Comprehensive position dashboard



## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Access to Etherlink Testnet

### Installation
```bash
npm install
npm run dev
```

### Configuration
1. Set up Supabase database
2. Configure environment variables
3. Deploy or connect to existing smart contracts
4. Test wallet connection and transactions

## Smart Contract Deployment

The prediction market contract should be deployed with:
- USDC token address as betting token
- Initial owner address for market creation rights
- Proper gas optimization for Etherlink network


