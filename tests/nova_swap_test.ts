[Previous test imports and setup remain unchanged...]

Clarinet.test({
  name: "Test complete flash loan cycle with repayment",
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
    
    // Take out flash loan
    let loan = chain.mineBlock([
      Tx.contractCall('nova-swap', 'flash-loan', [
        types.principal(deployer.address),
        types.uint(400000)
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
    
    // Verify can't repay twice
    let badRepay = chain.mineBlock([
      Tx.contractCall('nova-swap', 'repay-flash-loan', [
        types.principal(deployer.address)
      ], wallet1.address)
    ]);
    
    badRepay.receipts[0].result.expectErr(108); // err-no-active-loan
  },
});
