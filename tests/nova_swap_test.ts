Clarinet.test({
  name: "Test complete flash loan cycle with fees",
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
    
    // Calculate expected fee
    const loanAmount = 400000;
    const fee = Math.floor(loanAmount * 0.001); // 0.1% fee
    
    // Take out flash loan
    let loan = chain.mineBlock([
      Tx.contractCall('nova-swap', 'flash-loan', [
        types.principal(deployer.address),
        types.uint(loanAmount)
      ], wallet1.address)
    ]);
    
    loan.receipts[0].result.expectOk();
    
    // Repay flash loan with fee
    let repay = chain.mineBlock([
      Tx.contractCall('nova-swap', 'repay-flash-loan', [
        types.principal(deployer.address)
      ], wallet1.address)
    ]);
    
    repay.receipts[0].result.expectOk();
    
    // Test maximum loan limit
    let maxLoan = chain.mineBlock([
      Tx.contractCall('nova-swap', 'flash-loan', [
        types.principal(deployer.address),
        types.uint(600000) // Should fail as > 50% of pool
      ], wallet1.address)
    ]);
    
    maxLoan.receipts[0].result.expectErr(106); // err-flash-loan-limit
  },
});
