//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

interface IStateUtils {
    event SetDaoApps(
        address agentAppPrimary,
        address agentAppSecondary,
        address votingAppPrimary,
        address votingAppSecondary
        );

    event SetClaimsManagerStatus(
        address claimsManager,
        bool status
        );

    event SetStakeTarget(
        uint256 oldTarget,
        uint256 newTarget
        );

    event SetMaxApr(
        uint256 oldMaxApr,
        uint256 maxApr
        );

    event SetMinApr(
        uint256 oldMinApr,
        uint256 minApr
        );

    event SetUnstakeWaitPeriod(
        uint256 oldUnstakeWaitPeriod,
        uint256 unstakeWaitPeriod
        );

    event SetAprUpdateStep(
        uint256 oldAprUpdateStep,
        uint256 aprUpdateStep
        );

    event SetProposalVotingPowerThreshold(
        uint256 oldProposalVotingPowerThreshold,
        uint256 proposalVotingPowerThreshold
        );

    event UpdatedLastProposalTimestamp(
        address votingApp,
        address userAddress,
        uint256 lastProposalTimestamp
        );

    function setDaoApps(
        address _agentAppPrimary,
        address _agentAppSecondary,
        address _votingAppPrimary,
        address _votingAppSecondary
        )
        external;

    function setClaimsManagerStatus(
        address claimsManager,
        bool status
        )
        external;

    function setStakeTarget(uint256 _stakeTarget)
        external;

    function setMaxApr(uint256 _maxApr)
        external;

    function setMinApr(uint256 _minApr)
        external;

    function setUnstakeWaitPeriod(uint256 _unstakeWaitPeriod)
        external;

    function setAprUpdateStep(uint256 _aprUpdateStep)
        external;

    function setProposalVotingPowerThreshold(uint256 _proposalVotingPowerThreshold)
        external;

    function updateLastProposalTimestamp(address userAddress)
        external;
}
