import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure can create new liquidity pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Create test tokens first
    let block = chain.mineBlock([
      Tx.contractCall('nova-swap', 'create-pool', [
        types.principal(deployer.address),
        types.principal(wallet1.address),
        types.uint(1000000),
        types.uint(1000000)
      ], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk();
    
    // Verify pool details
    let poolCheck = chain.mineBlock([
      Tx.contractCall('nova-swap', 'get-pool-details', [
        types.principal(deployer.address),
        types.principal(wallet1.address)
      ], deployer.address)
    ]);
    
    const pool = poolCheck.receipts[0].result.expectSome();
    assertEquals(pool['balance-x'], types.uint(1000000));
    assertEquals(pool['balance-y'], types.uint(1000000));
  },
});

Clarinet.test({
  name: "Test token swap with slippage protection",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Create pool first
    let setup = chain.mineBlock([
      Tx.contractCall('nova-swap', 'create-pool', [
        types.principal(deployer.address),
        types.principal(wallet1.address),
        types.uint(1000000),
        types.uint(1000000)
      ], deployer.address)
    ]);
    
    // Perform swap
    let swap = chain.mineBlock([
      Tx.contractCall('nova-swap', 'swap-x-for-y', [
        types.principal(deployer.address),
        types.principal(wallet1.address),
        types.uint(1000),
        types.uint(990) // Min output with 1% slippage
      ], wallet2.address)
    ]);
    
    swap.receipts[0].result.expectOk();
    
    // Verify balances changed correctly
    let poolAfter = chain.mineBlock([
      Tx.contractCall('nova-swap', 'get-pool-details', [
        types.principal(deployer.address),
        types.principal(wallet1.address)
      ], deployer.address)
    ]);
    
    const finalPool = poolAfter.receipts[0].result.expectSome();
    assertEquals(finalPool['balance-x'], types.uint(1001000));
    assertTrue(finalPool['balance-y'] < types.uint(1000000));
  },
});

Clarinet.test({
  name: "Test liquidity provision",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Add liquidity
    let block = chain.mineBlock([
      Tx.contractCall('nova-swap', 'add-liquidity', [
        types.principal(deployer.address),
        types.principal(wallet1.address),
        types.uint(10000),
        types.uint(10000)
      ], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk();
    
    // Check LP tokens received
    let lpBalance = chain.mineBlock([
      Tx.contractCall('nova-swap', 'get-liquidity-balance', [
        types.principal(deployer.address),
        types.principal(wallet1.address),
        types.principal(deployer.address)
      ], deployer.address)
    ]);
    
    lpBalance.receipts[0].result.expectSome();
  },
});