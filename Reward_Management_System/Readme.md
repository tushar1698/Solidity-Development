# **Comprehensive Reward and Token Management System**

Welcome to the documentation for a robust **Reward and Token Management System** built on Solidity. This suite of smart contracts is designed to handle various functionalities like staking, vesting, reward distribution, and minting, with a focus on modularity, efficiency, and extensibility. Below, you'll find detailed explanations of the key components.

---

## **1. Overview**

This system comprises multiple contracts, each catering to a specific functionality:

- **VirtualBalanceRewardPool**: Manages reward allocation for stakers.
- **RewardDistributor**: Handles reward distribution intervals.
- **RewardTracker**: Tracks staking, locking, and reward claims.
- **MintableToken**: Provides minting and burning capabilities.
- **Vester**: Implements vesting logic for tokens.
- **BaseToken**: Abstract contract that extends mintable functionality with additional access control.

---

## **2. Contracts Breakdown**

### **2.1 VirtualBalanceRewardPool**

Manages staking rewards over a fixed duration.

- **Key Features:**
  - Tracks staked balances and calculates earned rewards.
  - Rewards are distributed based on a time-weighted average.
  - Offers an admin function for recovering accidentally sent tokens.
- **Key Functions:**
  - `updateStaked(address, uint256)`: Updates staking balances.
  - `getReward()`: Claims accumulated rewards.
  - `notifyRewardAmount(uint256)`: Adds rewards to the pool.

---

### **2.2 RewardDistributor**

Handles reward distribution intervals and minting for a connected tracker.

- **Key Features:**
  - Ensures tokens are distributed periodically.
  - Prevents accidental token loss with a `withdrawToken` function.
- **Key Functions:**
  - `setTokensPerInterval(uint256)`: Adjusts reward distribution rate.
  - `distribute()`: Mints and transfers rewards to the tracker.

---

### **2.3 RewardTracker**

Tracks staking, locking, and reward claiming.

- **Key Features:**
  - Supports boosted rewards for long-term locking.
  - Allows integration with multiple reward pools.
- **Key Functions:**
  - `deposit(uint256, uint256)`: Deposits tokens with an optional lock duration.
  - `claim(uint256)`: Claims rewards for the caller.
  - `updateBoostParameters(uint, uint, uint)`: Updates staking boost settings.

---

### **2.4 MintableToken**

A lightweight extension of the ERC20 token standard.

- **Key Features:**
  - Allows designated minters to mint tokens up to a pre-defined allowance.
  - Implements a `burn` function for token destruction.
- **Key Functions:**
  - `mint(address, uint256)`: Mints tokens to a specified address.
  - `burn(address, uint256)`: Burns tokens from a specified address.

---

### **2.5 Vester**
Implements token vesting logic for long-term incentives.
- **Key Features:**
  - Supports vesting with claimable rewards.
  - Allows depositing of both primary and paired tokens for rewards.
- **Key Functions:**
  - `deposit(uint256)`: Deposits tokens for vesting.
  - `withdraw()`: Claims rewards and withdraws vested tokens.
  - `_getNextClaimableAmount(address)`: Calculates the next claimable reward.

---

### **2.6 BaseToken**
Abstract base class that extends `MintableToken` with added features.
- **Key Features:**
  - Enforces private transfer mode for controlled transactions.
  - Overrides `_spendAllowance` to integrate custom handler logic.
- **Key Functions:**
  - `setInPrivateTransferMode(bool)`: Toggles private transfer mode.
  - `_beforeTokenTransfer(address, address, uint256)`: Implements transfer checks.

---

## **3. Key Highlights**

- **Modularity**: Each contract serves a specific purpose, making it easy to maintain and extend.
- **Security**: Uses OpenZeppelin libraries for robust token and ownership management.
- **Efficiency**: Optimized for gas savings with batch operations and low-level calls.
- **Extensibility**: Designed with hooks for additional reward pools and handlers.

---

## **4. Usage**

### **Deploying the Contracts**

1. Deploy `MintableToken` or a derived token contract (e.g., `BaseToken`).
2. Deploy `VirtualBalanceRewardPool` and link it with a reward token.
3. Deploy `RewardDistributor` and connect it to the reward tracker.
4. Deploy `RewardTracker` for staking and claiming logic.
5. Deploy `Vester` for long-term vesting incentives.

### **Integrating with Frontend**

- Use Web3.js or Ethers.js to interact with the contracts.
- Example for claiming rewards:
  
```javascript

  const contract = new ethers.Contract(rewardTrackerAddress, rewardTrackerABI, provider);
  await contract.claim(lockTime);
```

## Disclaimer

This code and documentation are provided for educational and demonstration purposes only. While every effort has been made to ensure the accuracy and security of the code:

- It may not be suitable for production use without further review and testing.
- The author is not liable for any damages, losses, or vulnerabilities arising from the use of this code.
- Users are advised to review, test, and audit the code thoroughly before deploying it in any environment.

By using this code, you acknowledge that it is provided “as-is,” without any warranties or guarantees. Always exercise caution and consult with security professionals before implementing smart contracts in live environments.

## Author: Tushar Bhatia
