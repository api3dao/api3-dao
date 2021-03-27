//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

interface IStateUtils {
    event SetDaoAgent(address daoAgent);

    event SetVotingApps(address[] votingApps);

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

    event SetAprUpdateCoefficient(
        uint256 oldAprUpdateCoefficient,
        uint256 aprUpdateCoefficient
        );

    event SetProposalVotingPowerThreshold(
        uint256 oldProposalVotingPowerThreshold,
        uint256 proposalVotingPowerThreshold
        );

    event PublishedSpecsUrl(
        uint256 proposalIndex,
        address userAddress,
        string specsUrl
        );

    function setDaoAgent(address _daoAgent)
        external;

    function setVotingApps(address[] calldata _votingApps)
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

    function setAprUpdateCoefficient(uint256 _aprUpdateCoefficient)
        external;

    function setProposalVotingPowerThreshold(uint256 _proposalVotingPowerThreshold)
        external;

    function publishSpecsUrl(
        uint256 proposalIndex,
        string calldata specsUrl
        )
        external;

    function updateLastVoteSnapshotBlock(uint256 snapshotBlock)
        external;
}
