# NovaSwap

A fast and efficient decentralized exchange (DEX) built on the Stacks blockchain. NovaSwap enables users to:

- Create liquidity pools for any token pair
- Swap tokens with minimal slippage 
- Add/remove liquidity to earn trading fees
- Get accurate price quotes before trading
- Access flash loans for advanced trading strategies
- Benefit from optimal routing for best swap rates

## Features

- Constant product automated market maker (AMM)
- Low gas fees and fast transactions
- Liquidity provider rewards
- Price oracle functionality 
- Secure swap mechanisms
- Flash loan functionality with safety limits
- Smart routing system

## Architecture

The contract implements the following core functionality:

1. Pool Creation and Management
2. Token Swaps with Optimal Routing
3. Liquidity Provider Operations
4. Price Calculations
5. Fee Distribution
6. Flash Loans with Risk Controls
7. Route Optimization

## Advanced Features

### Flash Loans
Flash loans allow users to borrow tokens without collateral within a single transaction. Key features:
- Maximum loan size of 50% of pool liquidity
- 0.1% fee charged on borrowed amount
- Loan must be repaid in same transaction block
- Fee tracking for protocol revenue analysis

### Optimal Routing
The smart routing system automatically finds the most efficient path for token swaps, either through direct pairs or via intermediate tokens, ensuring the best possible rates.

## Usage

See the contract documentation for detailed function usage and examples.
