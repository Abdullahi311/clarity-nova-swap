;; NovaSwap DEX Contract
;; Implements an automated market maker for token swaps

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-pool (err u101))
(define-constant err-insufficient-liquidity (err u102))
(define-constant err-slippage-exceeded (err u103))

;; Data vars
(define-data-var protocol-fee-percent uint u30) ;; 0.3%

;; Data maps
(define-map pools { token-x: principal, token-y: principal } 
  {
    liquidity: uint,
    balance-x: uint,
    balance-y: uint,
    fee-earned: uint
  }
)

(define-map liquidity-providers { pool-id: { token-x: principal, token-y: principal }, provider: principal }
  {
    liquidity-tokens: uint
  }
)

;; Internal Functions
(define-private (calculate-output (input-amount uint) (input-reserve uint) (output-reserve uint))
  (let (
    (input-with-fee (mul input-amount u997))
    (numerator (mul input-with-fee output-reserve))
    (denominator (add (mul input-reserve u1000) input-with-fee))
  )
  (div numerator denominator))
)

;; Public Functions
(define-public (create-pool (token-x principal) (token-y principal) (amount-x uint) (amount-y uint))
  (let (
    (pool-exists (map-get? pools { token-x: token-x, token-y: token-y }))
  )
  (asserts! (is-none pool-exists) (err u104))
  (try! (contract-call? token-x transfer amount-x tx-sender (as-contract tx-sender)))
  (try! (contract-call? token-y transfer amount-y tx-sender (as-contract tx-sender)))
  
  (map-set pools { token-x: token-x, token-y: token-y }
    {
      liquidity: (sqrti (mul amount-x amount-y)),
      balance-x: amount-x,
      balance-y: amount-y,
      fee-earned: u0
    }
  )
  (ok true))
)

(define-public (swap-x-for-y (token-x principal) (token-y principal) (amount-in uint) (min-out uint))
  (let (
    (pool (unwrap! (map-get? pools { token-x: token-x, token-y: token-y }) err-invalid-pool))
    (out-amount (calculate-output amount-in (get balance-x pool) (get balance-y pool)))
  )
  (asserts! (>= out-amount min-out) err-slippage-exceeded)
  
  (try! (contract-call? token-x transfer amount-in tx-sender (as-contract tx-sender)))
  (try! (as-contract (contract-call? token-y transfer out-amount (as-contract tx-sender) tx-sender)))
  
  (map-set pools { token-x: token-x, token-y: token-y }
    {
      liquidity: (get liquidity pool),
      balance-x: (+ (get balance-x pool) amount-in),
      balance-y: (- (get balance-y pool) out-amount),
      fee-earned: (+ (get fee-earned pool) (div amount-in u333))
    }
  )
  (ok out-amount))
)

(define-public (add-liquidity (token-x principal) (token-y principal) (amount-x uint) (amount-y uint))
  (let (
    (pool (unwrap! (map-get? pools { token-x: token-x, token-y: token-y }) err-invalid-pool))
    (liquidity-minted (div (mul amount-x (get liquidity pool)) (get balance-x pool)))
  )
  (try! (contract-call? token-x transfer amount-x tx-sender (as-contract tx-sender)))
  (try! (contract-call? token-y transfer amount-y tx-sender (as-contract tx-sender)))
  
  (map-set pools { token-x: token-x, token-y: token-y }
    {
      liquidity: (+ (get liquidity pool) liquidity-minted),
      balance-x: (+ (get balance-x pool) amount-x),
      balance-y: (+ (get balance-y pool) amount-y),
      fee-earned: (get fee-earned pool)
    }
  )
  
  (map-set liquidity-providers 
    { pool-id: { token-x: token-x, token-y: token-y }, provider: tx-sender }
    { liquidity-tokens: liquidity-minted }
  )
  (ok liquidity-minted))
)

;; Read-only functions
(define-read-only (get-pool-details (token-x principal) (token-y principal))
  (map-get? pools { token-x: token-x, token-y: token-y })
)

(define-read-only (get-exchange-rate (token-x principal) (token-y principal) (amount-in uint))
  (let (
    (pool (unwrap! (map-get? pools { token-x: token-x, token-y: token-y }) err-invalid-pool))
  )
  (ok (calculate-output amount-in (get balance-x pool) (get balance-y pool))))
)