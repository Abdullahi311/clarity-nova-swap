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
  name: "Test flash loan functionality",
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
    
    // Take flash loan
    let loan = chain.mineBlock([
      Tx.contractCall('nova-swap', 'flash-loan', [
        types.principal(deployer.address),
        types.uint(10000)
      ], wallet1.address)
    ]);
    
    loan.receipts[0].result.expectOk();
    
    // Repay flash loan
    let repay = chain.mineBlock([
      Tx.contractCall('nova-swap', 'repay-flash-loan', [
        types.principal(deployer.address)
      ], wallet1.address)
    ]);
    
    repay.receipts[0].result.expectOk();
  },
});

Clarinet.test({
  name: "Test optimal route swapping",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Setup pools
    let setup = chain.mineBlock([
      Tx.contractCall('nova-swap', 'create-pool', [
        types.principal(deployer.address),
        types.principal(wallet1.address),
        types.uint(1000000),
        types.uint(1000000)
      ], deployer.address)
    ]);
    
    // Test optimal route swap
    let swap = chain.mineBlock([
      Tx.contractCall('nova-swap', 'swap-tokens-optimal-route', [
        types.principal(deployer.address),
        types.principal(wallet1.address),
        types.uint(1000),
        types.uint(990)
      ], wallet2.address)
    ]);
    
    swap.receipts[0].result.expectOk();
  },
});
