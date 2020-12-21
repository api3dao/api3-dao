User:actor

/g Navigation
	Navigation Bar:class
		Connected wallet
	Connect Wallet:queue

/g Governance
	DAO Governance:note
		Voting dashboard (minimum share required to vote, account vote share)
		Governable parameter values & descriptions
		Create proposal
		View proposals
		Vote on proposals
	Create Proposal:service
		Only available if vote share high enough
	View proposals:oval
	Vote on proposal:queue
	View proposer profile:queue
	Delegate voting power:service

	New Proposal Editor:class
		DAO Governance Proposal
		Grant Proposal
		Arbitrary Transaction
	Submit or Cancel New Proposal:diamond

	Select Delegate:class
	View Delegate Profile:queue
	Submit or Cancel Delegation:diamond

Dashboard:note
	Account dashboard (total API3 tokens, tokens staked, withdrawable tokens, locked rewards, tokens locked for collateral)
	Global dashboard (Staking APY, total API3 tokens, tokens staked, % staked, staking target, epoch number, time to next epoch)

/g Staking
	Staking:note
		Staking APY, withdrawal and withdrawal request waiting periods
		Account staking information (including time until next possible withdrawal and request)
		Deposit API3 tokens
		Withdraw API3 tokens
		View locked inflationary rewards & vesting dates
	Stake:service
	Withdraw:service
	View locked rewards:oval

	Deposit tokens:class
		Deposit amount
	Submit or Cancel Deposit:diamond

	Request Withdrawal:class
		Enter withdrawal amount
		Shows cooldowns, tokens approved for withdrawal
	Subimt or Cancel Request:diamond
	Claim Withdrawal:service
		Available if request approved and time requirement met

/g Claims and IOUs
	Claims and IOUs:note
		View claims for tokens locked as collateral
		View amount of own tokens locked for each claim
	View claims:oval
	Redeem IOU:queue

User --> Dashboard

Navigation Bar --> Connect Wallet --> Navigation Bar
Navigation Bar -- Dashboard
Navigation Bar -- Staking
Navigation Bar -- Claims and IOUs
Navigation Bar -- DAO Governance

Staking --> Stake --> Deposit tokens --> Submit or Cancel Deposit
Staking --> Withdraw --> Request Withdrawal --> Subimt or Cancel Request --> Claim Withdrawal
Staking -- View locked rewards
Claims and IOUs -- View claims
View claims --> Redeem IOU --> View claims

DAO Governance --> Create Proposal
DAO Governance -- View proposals
DAO Governance --> Delegate voting power
View proposals --> Vote on proposal --> View proposals
View proposals --> View proposer profile
Create Proposal --> New Proposal Editor --> Submit or Cancel New Proposal
Delegate voting power --> Select Delegate
Select Delegate --> View Delegate Profile
Select Delegate --> Submit or Cancel Delegation

