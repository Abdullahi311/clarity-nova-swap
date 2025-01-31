import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

// Previous tests remain...

Clarinet.test({
  name: "Test flash loan functionality with limits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Setup pool with liquidity
    let setup = chain.mineBlock([
      Tx.contractCall('nova-swap', 'create-pool', [
        types.principal(deployer.address),
        types.principal(wallet1.address),
        types.uint(1000000),
        types.uint(1000000)
      ], deployer.address)
    ]);
    
    // Test valid flash loan under limit
    let loan = chain.mineBlock([
      Tx.contractCall('nova-swap', 'flash-loan', [
        types.principal(deployer.address),
        types.uint(400000) // 40% of pool
      ], wallet1.address)
    ]);
    
    loan.receipts[0].result.expectOk();
    
    // Test flash loan over limit
    let badLoan = chain.mineBlock([
      Tx.contractCall('nova-swap', 'flash-loan', [
        types.principal(deployer.address),
        types.uint(600000) // 60% of pool
      ], wallet1.address)
    ]);
    
    badLoan.receipts[0].result.expectErr(106); // err-flash-loan-limit
    
    // Repay valid flash loan
    let repay = chain.mineBlock([
      Tx.contractCall('nova-swap', 'repay-flash-loan', [
        types.principal(deployer.address)
      ], wallet1.address)
    ]);
    
    repay.receipts[0].result.expectOk();
  },
});

[Previous tests remain unchanged...]
