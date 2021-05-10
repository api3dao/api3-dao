/*
 * SPDX-License-Identitifer:    GPL-3.0-or-later
 */

pragma solidity 0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/IForwarder.sol";

import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/os/contracts/lib/math/SafeMath64.sol";

import "./interfaces/IApi3Pool.sol";


contract Api3Voting is IForwarder, AragonApp {
function c_0xa126c9f9(bytes32 c__0xa126c9f9) public pure {}

    using SafeMath for uint256;
    using SafeMath64 for uint64;

    bytes32 public constant CREATE_VOTES_ROLE = keccak256("CREATE_VOTES_ROLE");
    bytes32 public constant MODIFY_SUPPORT_ROLE = keccak256("MODIFY_SUPPORT_ROLE");
    bytes32 public constant MODIFY_QUORUM_ROLE = keccak256("MODIFY_QUORUM_ROLE");

    uint64 public constant PCT_BASE = 10 ** 18; // 0% = 0; 1% = 10^16; 100% = 10^18

    string private constant ERROR_NO_VOTE = "VOTING_NO_VOTE";
    string private constant ERROR_INIT_PCTS = "VOTING_INIT_PCTS";
    string private constant ERROR_CHANGE_SUPPORT_PCTS = "VOTING_CHANGE_SUPPORT_PCTS";
    string private constant ERROR_CHANGE_QUORUM_PCTS = "VOTING_CHANGE_QUORUM_PCTS";
    string private constant ERROR_INIT_SUPPORT_TOO_BIG = "VOTING_INIT_SUPPORT_TOO_BIG";
    string private constant ERROR_CHANGE_SUPPORT_TOO_BIG = "VOTING_CHANGE_SUPP_TOO_BIG";
    string private constant ERROR_CAN_NOT_VOTE = "VOTING_CAN_NOT_VOTE";
    string private constant ERROR_CAN_NOT_EXECUTE = "VOTING_CAN_NOT_EXECUTE";
    string private constant ERROR_CAN_NOT_FORWARD = "VOTING_CAN_NOT_FORWARD";
    string private constant ERROR_NO_VOTING_POWER = "VOTING_NO_VOTING_POWER";

    enum VoterState { Absent, Yea, Nay }

    struct Vote {
        bool executed;
        uint64 startDate;
        uint64 snapshotBlock;
        uint64 supportRequiredPct;
        uint64 minAcceptQuorumPct;
        uint256 yea;
        uint256 nay;
        uint256 votingPower;
        bytes executionScript;
        mapping (address => VoterState) voters;
    }

    uint64 public supportRequiredPct;
    uint64 public minAcceptQuorumPct;
    uint64 public voteTime;

    IApi3Pool public api3Pool;
    mapping (address => uint256) private userAddressToLastNewProposalTimestamp;

    // We are mimicing an array, we use a mapping instead to make app upgrade more graceful
    mapping (uint256 => Vote) internal votes;
    uint256 public votesLength;

    event StartVote(uint256 indexed voteId, address indexed creator, string metadata);
    event CastVote(uint256 indexed voteId, address indexed voter, bool supports, uint256 stake);
    event ExecuteVote(uint256 indexed voteId);
    event ChangeSupportRequired(uint64 supportRequiredPct);
    event ChangeMinQuorum(uint64 minAcceptQuorumPct);

    modifier voteExists(uint256 _voteId) {c_0xa126c9f9(0x622436fcd056d802f054e25bdcf1d74c774b9f5a3ed2f6b068651e2f383f5311); /* function */ 

c_0xa126c9f9(0x8340ab3cc083678eb50aefbf17fd4a547c8bd6397a989f6575cf20037f0fc204); /* line */ 
        c_0xa126c9f9(0x5f6537610f3c7b2be55e18678a1bc7b6f3fc005c3c9efdd5423d05557ec10408); /* requirePre */ 
c_0xa126c9f9(0xf073d787d04ebe27ec6361e900e3cf6d43296065ab46ec89cfe6bf809c63613d); /* statement */ 
require(_voteId < votesLength, ERROR_NO_VOTE);c_0xa126c9f9(0xb5f6d8068096736818429c1307b483d281f6c7faa85c32c1bf425bd75daebb61); /* requirePost */ 

c_0xa126c9f9(0x7de3f1fa16a12cd972b4978da20bd9e34b2f0f2ca4698bfbc5060e43e4be0cdc); /* line */ 
        _;
    }

    /**
    * @notice Initialize Voting app with `_token.symbol(): string` for governance, minimum support of `@formatPct(_supportRequiredPct)`%, minimum acceptance quorum of `@formatPct(_minAcceptQuorumPct)`%, and a voting duration of `@transformTime(_voteTime)`
    * @param _token MiniMeToken Address that will be used as governance token
    * @param _supportRequiredPct Percentage of yeas in casted votes for a vote to succeed (expressed as a percentage of 10^18; eg. 10^16 = 1%, 10^18 = 100%)
    * @param _minAcceptQuorumPct Percentage of yeas in total possible votes for a vote to succeed (expressed as a percentage of 10^18; eg. 10^16 = 1%, 10^18 = 100%)
    * @param _voteTime Seconds that a vote will be open for token holders to vote (unless enough yeas or nays have been cast to make an early decision)
    */
    function initialize(
        address _token,
        uint64 _supportRequiredPct,
        uint64 _minAcceptQuorumPct,
        uint64 _voteTime
    )
        external
        onlyInit
    {c_0xa126c9f9(0xf874e50bfae3d0030ecb9e76311f52805323537e1ba7365cad4d3d22c66b532e); /* function */ 

c_0xa126c9f9(0xda873b250f005002d4537f11136f12efdb77e5f1da444fe67899a5999f1be19f); /* line */ 
        c_0xa126c9f9(0x70076db21375e3a83b6c4754a4938b44189cb7a37c9465e981eb9188fffd8ff1); /* statement */ 
initialized();

c_0xa126c9f9(0xd9292caed2285cb2e580f44834f066d7ac1455094c34841163ede2d45d362d8a); /* line */ 
        c_0xa126c9f9(0x2c0449e786c108980630c2b63c4e35cbc6331b7c9578b5ee2e9fa08730d03f3a); /* requirePre */ 
c_0xa126c9f9(0x82fe3302bb5dc1c8a0078ee340aff80594fddcc088d40bfbf18a874c79c8f328); /* statement */ 
require(_minAcceptQuorumPct <= _supportRequiredPct, ERROR_INIT_PCTS);c_0xa126c9f9(0x47176a533710dc67a17fe3f80e570b68a70fde2b9526ad877e0177e9f5ea3eac); /* requirePost */ 

c_0xa126c9f9(0x9314641d9cfc57171bb668316713cfffcf59ed58ea04a76983cafa5a7f4a0741); /* line */ 
        c_0xa126c9f9(0x3a67e9b203cf008da75fed2f1a7ac40b49cbb6070b551bf421f7df776589d46f); /* requirePre */ 
c_0xa126c9f9(0x714a3009c21a06742cc5d8550e95ba939224ae5e2998111e406f3f2e91b41bf8); /* statement */ 
require(_supportRequiredPct < PCT_BASE, ERROR_INIT_SUPPORT_TOO_BIG);c_0xa126c9f9(0x3fee1ae90daf2f2d35097729f55bf6f13e401f7da77a1b969837fae336073e6c); /* requirePost */ 


c_0xa126c9f9(0xa59361244b302683ff4a178b637671aa0e88cc4ba21ef6c2f486faee630cf100); /* line */ 
        c_0xa126c9f9(0x4c663fb475022c2cf30e848129b9e1074c1f7523b1376d1e0012aa6d27d2a37c); /* statement */ 
supportRequiredPct = _supportRequiredPct;
c_0xa126c9f9(0xa4791afd8257b4199f910485f0e5eb4d489c8cb648a5dfa358eeb1a226e20f43); /* line */ 
        c_0xa126c9f9(0x6f8ab9aadc0864182168edd30a40501afc215da3d02fc62dc41312c584222c77); /* statement */ 
minAcceptQuorumPct = _minAcceptQuorumPct;
c_0xa126c9f9(0xb351848734795e05f16c5fed002f42f2767b15a255a51204c0c7274138ae92c1); /* line */ 
        c_0xa126c9f9(0x259335e5108b277fda090b7d8e9ebc41d8ff98038442ecf108891ece902795e4); /* statement */ 
voteTime = _voteTime;
        // The pool acts as the MiniMe token
c_0xa126c9f9(0x758e4bce53e3a7410da51508dd3b27572a90c7b2958a80bb10a860992ef0b346); /* line */ 
        c_0xa126c9f9(0x1d3187f027d1260537f1274f31c5af04b083c795ac6c05496f710757f372752f); /* statement */ 
api3Pool = IApi3Pool(_token);
    }

    /**
    * @notice Change required support to `@formatPct(_supportRequiredPct)`%
    * @param _supportRequiredPct New required support
    */
    function changeSupportRequiredPct(uint64 _supportRequiredPct)
        external
        authP(MODIFY_SUPPORT_ROLE, arr(uint256(_supportRequiredPct), uint256(supportRequiredPct)))
    {c_0xa126c9f9(0x1cce5f35f364ed3af83cc712d2f14555d48964584f2ff66c04b642a9eb8b5bc0); /* function */ 

c_0xa126c9f9(0x8bf74dfcaf198eb0b9563e60f0ea1d469f9a1b7031b19d2bf94931c24232b974); /* line */ 
        c_0xa126c9f9(0xb18b91e38e51ccd1c9d6d132a60ef678c2c62c21161f04d6aaac9a705a8b0ce6); /* requirePre */ 
c_0xa126c9f9(0x1d9645b8fbaac7505ce7ac4f9cd3a13f44f1a6bae3116ab46d96d1570bcb7734); /* statement */ 
require(minAcceptQuorumPct <= _supportRequiredPct, ERROR_CHANGE_SUPPORT_PCTS);c_0xa126c9f9(0x4ddafdb090a6ad7c5c316146ffa937198ea7b0742c1a493ed30df2c7aab07f5d); /* requirePost */ 

c_0xa126c9f9(0xe862aa87b8441888ab4bb6f8a162863daa1593b3bcdc38019e2d0478c4ec9c59); /* line */ 
        c_0xa126c9f9(0x90a4489a68a96edf450e5c7029b3b0911ef05cce4bc2a6f45b6fb3fb83933487); /* requirePre */ 
c_0xa126c9f9(0xb0df34d6b1510d29e6a27a6647c005b944958bbf2ab4266b7152b11b4497cecd); /* statement */ 
require(_supportRequiredPct < PCT_BASE, ERROR_CHANGE_SUPPORT_TOO_BIG);c_0xa126c9f9(0xaf1bf8477c658d6080d9ab489345d8315d2cbc0cdf3b74b4f9847b872aa81fb1); /* requirePost */ 

c_0xa126c9f9(0x25ffecc24ad804bfb3d12565c9ab8db68cb2b4c07736b59e2e9fcb415c2d8e47); /* line */ 
        c_0xa126c9f9(0x8dbf3b0a03a6159a33367c69cd22d519b1b1200c99aece634aa84b17424c8d99); /* statement */ 
supportRequiredPct = _supportRequiredPct;

c_0xa126c9f9(0x0837ae363f649260571cba01e015faed1654db365730601604a1dbba3afeeec3); /* line */ 
        c_0xa126c9f9(0x4b0b763dcb5926a1d0378ba14f14b63d38abb7a04b6c1d2d934f77acf536fcd7); /* statement */ 
emit ChangeSupportRequired(_supportRequiredPct);
    }

    /**
    * @notice Change minimum acceptance quorum to `@formatPct(_minAcceptQuorumPct)`%
    * @param _minAcceptQuorumPct New acceptance quorum
    */
    function changeMinAcceptQuorumPct(uint64 _minAcceptQuorumPct)
        external
        authP(MODIFY_QUORUM_ROLE, arr(uint256(_minAcceptQuorumPct), uint256(minAcceptQuorumPct)))
    {c_0xa126c9f9(0x4eb7f0b68d5efa1c6ee63eda183bb1877e258f35ca198a4a345c24be63e2db9a); /* function */ 

c_0xa126c9f9(0x3aa39ab11013af01a09d686252bfefd0197ca47ce552c6e655268f3458b11d50); /* line */ 
        c_0xa126c9f9(0xcefd95c31921ffed6af1122982e75dd62e8655478ac56aed55b5ea34113ab788); /* requirePre */ 
c_0xa126c9f9(0xd8e59aaa7c9a6db8bf5b146ca02b0d3137036d32e64bce1e00c8d29c18fba921); /* statement */ 
require(_minAcceptQuorumPct <= supportRequiredPct, ERROR_CHANGE_QUORUM_PCTS);c_0xa126c9f9(0xe9afa08e59c7b917240ee0d98d17b11adebb30e910ea3aab133402c401450a74); /* requirePost */ 

c_0xa126c9f9(0x33cf7288d914ea096ba6359054b7a0683d25051cb619c5c4f6fa8f2e82e03450); /* line */ 
        c_0xa126c9f9(0xcb1afad4ee9531d82700a86f147367f7e2ea147d71a08d00e4c14217bf4ce401); /* statement */ 
minAcceptQuorumPct = _minAcceptQuorumPct;

c_0xa126c9f9(0x0e4dee7128d5829e9f207bb3c1fd5e63bfac97bbdc2ebfb180a4f6594cf2225e); /* line */ 
        c_0xa126c9f9(0xffba97bca3000df56ded0371bad363b823d5a43d4f301c32bdc61cb235f0cf94); /* statement */ 
emit ChangeMinQuorum(_minAcceptQuorumPct);
    }

    /**
    * @notice Create a new vote about "`_metadata`"
    * @param _executionScript EVM script to be executed on approval
    * @param _metadata Vote metadata
    * @return voteId Id for newly created vote
    */
    function newVote(bytes _executionScript, string _metadata) external auth(CREATE_VOTES_ROLE) returns (uint256 voteId) {c_0xa126c9f9(0x2cbe9917be381e0b865256cc8add5faf5189c99ac1bbfb5125382e795bdbd343); /* function */ 

c_0xa126c9f9(0xbbd5c7da77c13dfa8b069d3748d6061985763386aa75b02607e33fb54265f730); /* line */ 
        c_0xa126c9f9(0xcdc9c094691ef32fb3a34f47dcc0e1ed5d306c637318a28ba931c830aa9b8934); /* statement */ 
return _newVote(_executionScript, _metadata, true, true);
    }

    /**
    * @notice Create a new vote about "`_metadata`"
    * @param _executionScript EVM script to be executed on approval
    * @param _metadata Vote metadata
    * @param _castVote Whether to also cast newly created vote
    * @param _executesIfDecided Whether to also immediately execute newly created vote if decided
    * @return voteId id for newly created vote
    */
    function newVote(bytes _executionScript, string _metadata, bool _castVote, bool _executesIfDecided)
        external
        auth(CREATE_VOTES_ROLE)
        returns (uint256 voteId)
    {c_0xa126c9f9(0x6131f17f78039031b7942cd3bba0ddc32d8b9a8a3db563dc54b3a6d4eb492312); /* function */ 

c_0xa126c9f9(0x3459f5842230157bf2f0347a921e67d8c6099c0b1d3acb623f4f9810a4204b6c); /* line */ 
        c_0xa126c9f9(0x2085200ad2129e13de5a632751616040bd553e8f256e0353ca630ce30b4df701); /* statement */ 
return _newVote(_executionScript, _metadata, _castVote, _executesIfDecided);
    }

    /**
    * @notice Vote `_supports ? 'yes' : 'no'` in vote #`_voteId`
    * @dev Initialization check is implicitly provided by `voteExists()` as new votes can only be
    *      created via `newVote(),` which requires initialization
    * @param _voteId Id for vote
    * @param _supports Whether voter supports the vote
    * @param _executesIfDecided Whether the vote should execute its action if it becomes decided
    */
    function vote(uint256 _voteId, bool _supports, bool _executesIfDecided) external voteExists(_voteId) {c_0xa126c9f9(0x169f769b4394ca7cda3dafcab94e183b0a936f7c273ee76aaee1c3cd2d71f597); /* function */ 

c_0xa126c9f9(0x26419acba92208f2c59f1bd06ffeb469c0b746e1c066ed5ad2846d6285bed292); /* line */ 
        c_0xa126c9f9(0x1fafd9e3f2fe0ba3ac3d269cd7f8f53ca3bd341c100cc209de918df396323b63); /* requirePre */ 
c_0xa126c9f9(0x2ea2cfc5cfe36a593145e7fa50f7fd5c089366eca7dc4c6962a794cd6ae0c936); /* statement */ 
require(_canVote(_voteId, msg.sender), ERROR_CAN_NOT_VOTE);c_0xa126c9f9(0x3cd627229f4661cd34437e947cbda928c0b8275756bcf876a11f73f66e140932); /* requirePost */ 

c_0xa126c9f9(0x6541b65d36fbf017604b3fd39ce7aab4f3c8020d08b6b4b98271a3ede25377af); /* line */ 
        c_0xa126c9f9(0x514a8381b5f9e4dc7a530951371241c7f62be76908ecb23cc16196b0adbdc477); /* statement */ 
_vote(_voteId, _supports, msg.sender, _executesIfDecided);
    }

    /**
    * @notice Execute vote #`_voteId`
    * @dev Initialization check is implicitly provided by `voteExists()` as new votes can only be
    *      created via `newVote(),` which requires initialization
    * @param _voteId Id for vote
    */
    function executeVote(uint256 _voteId) external voteExists(_voteId) {c_0xa126c9f9(0x1cf9d035364c84ecc5e6ffbf6dfe4c27cd5549b9af1a4b3458c2a1dafe2a1b29); /* function */ 

c_0xa126c9f9(0x006b6b849f6f26c46b71d658c0d79e31ec1f0d8a08c044d319bc494deb717834); /* line */ 
        c_0xa126c9f9(0xe824a921fbf72f16a1f6ac37cb361108cdf916f9ee58390849ca4b1c6934fe20); /* statement */ 
_executeVote(_voteId);
    }

    // Forwarding fns

    function isForwarder() external pure returns (bool) {c_0xa126c9f9(0x1616faededc5cb85cb6519271f5e21e506eced90b70c8e7e98720d561f6d05eb); /* function */ 

c_0xa126c9f9(0xf05a2f356a216003f5c3ddf2684ed1f302b3c6670734574282756802323dc197); /* line */ 
        c_0xa126c9f9(0x169131f74adfafb6c49ddc07b3a688dabf5c78205d17fb2c50ee008ceb7b91a4); /* statement */ 
return true;
    }

    /**
    * @notice Creates a vote to execute the desired action, and casts a support vote if possible
    * @dev IForwarder interface conformance
    * @param _evmScript Start vote with script
    */
    function forward(bytes _evmScript) public {c_0xa126c9f9(0x5353f016cb60180ff821dbca0753877e08affa36c9fab2ca96e508440850c707); /* function */ 

c_0xa126c9f9(0x340f708816441d8250e0eeda1f11b1e7bed78c19654dc7a4121c1fef95d57dbb); /* line */ 
        c_0xa126c9f9(0x7d1f2d8b2385bd03eb0e3296248d415fca4cc5d05f1e127e260caae61fc24197); /* requirePre */ 
c_0xa126c9f9(0x0c66a70913a3d8829bf97cccd60ebdc77bd34a92b8a7df3d9281486899d444a4); /* statement */ 
require(canForward(msg.sender, _evmScript), ERROR_CAN_NOT_FORWARD);c_0xa126c9f9(0x21d2108eed4164296b3710a1e20f192e0e1e188f2c50c17662d256060b8cccbb); /* requirePost */ 

c_0xa126c9f9(0xa73231f847a0921e8e24a707aebac0298ac83aa163e7cafb5e69021b12fe2d3b); /* line */ 
        c_0xa126c9f9(0xf420a5d1fa0a7d439039a7cce4cfc9e0cd113d9eb572f39152794989265fa492); /* statement */ 
_newVote(_evmScript, "", true, true);
    }

    function canForward(address _sender, bytes) public view returns (bool) {c_0xa126c9f9(0xf977e45e7165fd14980513b273534b18fa4569487f9716a453222843190d3f3f); /* function */ 

        // Note that `canPerform()` implicitly does an initialization check itself
c_0xa126c9f9(0x1b5ebbc3376ffd25690f8b87666dfdfb0248b8b1653c34a16da1f9ebebc20fa4); /* line */ 
        c_0xa126c9f9(0xf5960bc383480fce20613d7ba8aa9acd1ad510990580b3876d2da3ccb9b19bea); /* statement */ 
return canPerform(_sender, CREATE_VOTES_ROLE, arr());
    }

    // Getter fns

    /**
    * @dev Initialization check is implicitly provided by `voteExists()` as new votes can only be
    *      created via `newVote(),` which requires initialization
    */
    function canExecute(uint256 _voteId) public view voteExists(_voteId) returns (bool) {c_0xa126c9f9(0x5eae59eafe475af33e8e715c154f2e9b59322c2ec63500a7a6611135c3c649b0); /* function */ 

c_0xa126c9f9(0x1c43644462f201be590135580593ecaac62ac774b343e341464c0024e78bd928); /* line */ 
        c_0xa126c9f9(0x379ee183b1da366347fbae283f87054bbc947f4c126aef7e8e692ab14b561ac3); /* statement */ 
return _canExecute(_voteId);
    }

    /**
    * @dev Initialization check is implicitly provided by `voteExists()` as new votes can only be
    *      created via `newVote(),` which requires initialization
    */
    function canVote(uint256 _voteId, address _voter) public view voteExists(_voteId) returns (bool) {c_0xa126c9f9(0x5cc3db031ede6fc897a43e37009e20fc3103d87359b2ff28edb02474355411ea); /* function */ 

c_0xa126c9f9(0x9ffc6bdfc8b647b024f2b5617768a4424ef2a2fda3c603626982ccf26674fd80); /* line */ 
        c_0xa126c9f9(0x4b50d22de3cbcdcc743b96b18c2d16010829e3745377cd2b13177e4e0ee368a6); /* statement */ 
return _canVote(_voteId, _voter);
    }

    function getVote(uint256 _voteId)
        public
        view
        voteExists(_voteId)
        returns (
            bool open,
            bool executed,
            uint64 startDate,
            uint64 snapshotBlock,
            uint64 supportRequired,
            uint64 minAcceptQuorum,
            uint256 yea,
            uint256 nay,
            uint256 votingPower,
            bytes script
        )
    {c_0xa126c9f9(0x46ca8df77b52733a955f654f7d4e0000183beb835c280767641d2ca3d71f7b7c); /* function */ 

c_0xa126c9f9(0x4b1c2006423b5a9a4d68b85baeded8afce300148f032bcb7dd4915628e0c33f2); /* line */ 
        c_0xa126c9f9(0xb71fa9fa96de5322f6fc703139b81868f5f09f6dabbb447acf7af97f6e402cce); /* statement */ 
Vote storage vote_ = votes[_voteId];

c_0xa126c9f9(0xb825dc8939f2821977f1dd482ade7c23a0f84a3e396cc5d1a70f1ba0f9a4f2dc); /* line */ 
        c_0xa126c9f9(0x45345795c965d9fd7a776c12932974f03526b5bd35c59ad92bda20de217872c8); /* statement */ 
open = _isVoteOpen(vote_);
c_0xa126c9f9(0x77d39fb45fad0b7c9d8552b7829e6d7f7ddb0a5681f5a10fcd10e322e4b92982); /* line */ 
        c_0xa126c9f9(0x4983abc4ec73c7c6e0612f708bd6f0fe2cb622c5006d809b40a637ae5ecd0bb3); /* statement */ 
executed = vote_.executed;
c_0xa126c9f9(0xc4b41f53c61c811695bd48f18fe23fe17dcdedc390b9f0c2ebb47a2599914ea3); /* line */ 
        c_0xa126c9f9(0x3b60c77d619f12b54c85e0ebd75dec5dff7f25829c2faa510bf45d0a97840452); /* statement */ 
startDate = vote_.startDate;
c_0xa126c9f9(0x8fb73cf368e7eb1be98cd1a1c77fd83e55f958e85b46d40ebf8c98bad907f375); /* line */ 
        c_0xa126c9f9(0x866eaa1e8d8ca097a7155ed3c26c1c32a51eeaca7f173a74a817bad7e0c9bf1a); /* statement */ 
snapshotBlock = vote_.snapshotBlock;
c_0xa126c9f9(0x48695e4db0686a1de794fbe67162f0e6e9d66040c64c23edc68219b1bcc22b2a); /* line */ 
        c_0xa126c9f9(0x23cea624553b4df6372ec649141e111b17d394b2325feb4a76273e733da661a1); /* statement */ 
supportRequired = vote_.supportRequiredPct;
c_0xa126c9f9(0x6efb6219251358b7bffc6eca95781032f7936f1f30b8427a47d9bf97479d959b); /* line */ 
        c_0xa126c9f9(0x3ee3589e2edee62a0b11179340f220908bbf7ce201ffeaa400f7ae0133bcc416); /* statement */ 
minAcceptQuorum = vote_.minAcceptQuorumPct;
c_0xa126c9f9(0x8caf0d5cf2a897b0910111522f16d47b9fd097fe532d53520671d6646becc905); /* line */ 
        c_0xa126c9f9(0x0491758efc17d963f4f55c5edba391e3356ef3a0a8778f4b33b863d7337c3ece); /* statement */ 
yea = vote_.yea;
c_0xa126c9f9(0x7b6fae1866e9ed1570d63bf5078a3c3ec0bcfbff885da961441b1492ce5a2158); /* line */ 
        c_0xa126c9f9(0x11d255ba46582668c5706c541b89bfa2b3ea2f0fda31abd0890bd620f5286f90); /* statement */ 
nay = vote_.nay;
c_0xa126c9f9(0x8e2c80e97093d7521049837ac457ebed499b64905a0a27da1aa8eba68e196938); /* line */ 
        c_0xa126c9f9(0xe56aac5d9293ab3e1ba0c9d22569439ffa57878fb661f7f5515a4a2e7e9172f0); /* statement */ 
votingPower = vote_.votingPower;
c_0xa126c9f9(0x635ca9b66b311cabe4c8e5b2cefaf283479c5d44322386cd2a8108154273ec31); /* line */ 
        c_0xa126c9f9(0xaf730bc7d490dabeab73ec2f8b93f1e13070cb8018a59d31dd43564df10323c2); /* statement */ 
script = vote_.executionScript;
    }

    function getVoterState(uint256 _voteId, address _voter) public view voteExists(_voteId) returns (VoterState) {c_0xa126c9f9(0xf7e4f1a85dbbed3bc590d77cd10eb7ee5090a6e473ca44dff5a9bfd47addb3b6); /* function */ 

c_0xa126c9f9(0xb0876c79782df7159a00889a7d07ce7bb5f01258351e32401b1a4460e506f4c4); /* line */ 
        c_0xa126c9f9(0x9063ab27e5034f627a602c7212c0c2aeeda5585bb26b14b975364ca99a180f79); /* statement */ 
return votes[_voteId].voters[_voter];
    }

    // Internal fns

    function _newVote(bytes _executionScript, string _metadata, bool _castVote, bool _executesIfDecided)
        internal
        returns (uint256 voteId)
    {c_0xa126c9f9(0x02904a9b54a33bbd612cc5d216da09258bed4b1ff894aa867bd25c2c77168c7a); /* function */ 

c_0xa126c9f9(0x31abd1eab16554006b8279f3f265b492622a8a1d608c471cf7b6486a704f6f49); /* line */ 
        c_0xa126c9f9(0xd4171a4abf7947ab9e477383bd24ed221bcf041e148e2d8f7ed0f97fe390d727); /* requirePre */ 
c_0xa126c9f9(0x96309fc97555ef27755b84e4bc9d819a08760a5ebc5c5d7c9e71d91834e70455); /* statement */ 
require(userAddressToLastNewProposalTimestamp[msg.sender].add(api3Pool.EPOCH_LENGTH()) < now, "API3_HIT_PROPOSAL_COOLDOWN");c_0xa126c9f9(0x1757a9d64495deaa491c691f6a524ba18934f155af569fe688550eafa36835de); /* requirePost */ 

c_0xa126c9f9(0xca69418a612e179c260ec8d46f8432c3e9818eb9443131d715cbc5b8de272d0f); /* line */ 
        c_0xa126c9f9(0xda88cc6409247eba9cee5cced924b735e0b4030763d2e1e02d91aa6b5f9954c6); /* statement */ 
userAddressToLastNewProposalTimestamp[msg.sender] = now;

c_0xa126c9f9(0xfe30ad1595d4b4d9a2703eb6473ce5f021f9ef325d42e4803a78ade52dc00cb8); /* line */ 
        c_0xa126c9f9(0x99b2c52d8e48025112f101aa325a815802408724c379dfa8380c052dc638d031); /* statement */ 
uint64 snapshotBlock = getBlockNumber64() - 1; // avoid double voting in this very block

c_0xa126c9f9(0x2579ca03c038866aaf769c907631d09441303ddad0da6570f99dd8a24fd666d6); /* line */ 
        c_0xa126c9f9(0x18ec92ebeb845d3101ff2107a506b9a24658cb9cf6527ba69c00ec7660b8cd3f); /* statement */ 
uint256 votingPower = api3Pool.totalSupplyOneBlockAgo();
c_0xa126c9f9(0x01e2c9448516ced719eff94704d56b839991871f2868026869193b8dcaea024e); /* line */ 
        c_0xa126c9f9(0xcfdd8709be26b27612e0a29d87dfd5348f2fb520d7095d5ac9cd00d1a723762b); /* requirePre */ 
c_0xa126c9f9(0xff8f0efda06303c2038b8281d65f203814d82f8470b5ae26996e61ff7e29910e); /* statement */ 
require(votingPower > 0, ERROR_NO_VOTING_POWER);c_0xa126c9f9(0x818241df244f3b1bbd66edcf6b5dc4cecc74e13091b03ad21ee2ec550b639fbd); /* requirePost */ 

c_0xa126c9f9(0xdc81895289f0e8965236a1aa5b463d10adeb3698b1da9e01190babc6a9e3dee7); /* line */ 
        c_0xa126c9f9(0xc1556a85dff89ab30f5de5f2f0587e9563d572d866688afff8026689e09b49a4); /* statement */ 
uint256 proposalMakerVotingPower = api3Pool.balanceOfAt(msg.sender, snapshotBlock);
c_0xa126c9f9(0x466ee7e5a300c647a0353f0abd8f0f1c5d5c839e13ef18cb31a1ee0dfe2151c0); /* line */ 
        c_0xa126c9f9(0x4730426ba1ee489f2ba5f9329621045b4c123f83a8e4a6eeffae2860cafcec99); /* requirePre */ 
c_0xa126c9f9(0xf455b0c289448c3e56c619c659a06ee8a9c96c643fe240ee372150657e2ec7e8); /* statement */ 
require(
            proposalMakerVotingPower >= votingPower.mul(api3Pool.proposalVotingPowerThreshold()).div(1e8),
            "API3_HIT_PROPOSAL_THRESHOLD"
            );c_0xa126c9f9(0xf425ff89655c23249b63e027958b82e36f452fb302bbb212e26c7c9fa60d569a); /* requirePost */ 

c_0xa126c9f9(0x186968eebe560dcb373b6720ec4059e638228ec7608680865e83726e0f9c6a59); /* line */ 
        c_0xa126c9f9(0x6303389e66e9e567c1447e5a1d55aa6121afcab547d80c501dc8ee1681b33810); /* statement */ 
api3Pool.updateLastVoteSnapshotBlock(snapshotBlock);

c_0xa126c9f9(0x1d85ff03a73a1292a7fe6d1a7afecb9f92d02fc30ca1d4f7e17daf55cf14d347); /* line */ 
        c_0xa126c9f9(0xea6c7d58fe2d12a622e7095f179a756941927be3815348cdb3c2b65b506ce342); /* statement */ 
voteId = votesLength++;

c_0xa126c9f9(0x0bfa5c465837f0fc38b2297b43dc595214db15f7b5f3cfddced20d6cc731d669); /* line */ 
        c_0xa126c9f9(0x7403e90bacf055ff7f967c61fd22882c1f8789f71d57d3374a29735664c031be); /* statement */ 
Vote storage vote_ = votes[voteId];
c_0xa126c9f9(0x595da79f0484757e702758f96174ca0cb0eb9cfab5cf4aa7cb2aeec79a65728a); /* line */ 
        c_0xa126c9f9(0x254160749e252418bcf9982b87a23719b4df1b61a8d8cf5cd42c0cb31c121f85); /* statement */ 
vote_.startDate = getTimestamp64();
c_0xa126c9f9(0xa32bcfa8b677984d787f4586c4b8d830f3b4cf030bbb586e97bc7514bb66333f); /* line */ 
        c_0xa126c9f9(0x5468a4158a85e33c40aff40a16c1a103f81120bac7aca59cd1866e66a5ca03bf); /* statement */ 
vote_.snapshotBlock = snapshotBlock;
c_0xa126c9f9(0x0936da7978475080ef8e0207d272dc98375f416c008d95a52288b61d12ea8611); /* line */ 
        c_0xa126c9f9(0xfdd83e371ebb24efb3f9ecfe17fed10158bedda506a6ca0efd9f60297d2e6557); /* statement */ 
vote_.supportRequiredPct = supportRequiredPct;
c_0xa126c9f9(0x98e7b39792186751b7cbf5028a9d5a60e492e147739cbb69ae586ea1695c8956); /* line */ 
        c_0xa126c9f9(0x6703a11cd2310458253efc63701a4da6d1886fb7fa44dd8df6adbd13fd9847cc); /* statement */ 
vote_.minAcceptQuorumPct = minAcceptQuorumPct;
c_0xa126c9f9(0x9696ef1ffc924f9829be377e88ac8fb3fd0058f0dc91165219d3b028aebb978f); /* line */ 
        c_0xa126c9f9(0x2e9ac92dda58f5cddd1e53009735b4596b812c2f88932f81c6e1e044616b7e0b); /* statement */ 
vote_.votingPower = votingPower;
c_0xa126c9f9(0x8dad650c57674ee83f7131a2f362969bbd1e258121c067a39db0bc845e8bd2d7); /* line */ 
        c_0xa126c9f9(0x0409d459e77484bfc5ec40a80fa344e713fbd92ab4015c5b9839b960f52dc7d5); /* statement */ 
vote_.executionScript = _executionScript;

c_0xa126c9f9(0xab868e590f6ad6365c8ef59e95f37e2f1da47442116a3a54d0af0633632f006c); /* line */ 
        c_0xa126c9f9(0x80ef1ed014f6dac38907528f63ae183446e7fa46d5321f348d1050867b6ee14c); /* statement */ 
emit StartVote(voteId, msg.sender, _metadata);

c_0xa126c9f9(0xbc0fb9d5d1d4b9acfdc5d39febe8db76458005563ab26022b74e990f575d2564); /* line */ 
        c_0xa126c9f9(0x22d6c51e539885dadc653fb25d0bac2db44b396b219493ab03cecd433cd82666); /* statement */ 
if (_castVote && _canVote(voteId, msg.sender)) {c_0xa126c9f9(0x2f48878a6a79d624820dccb8d890fd8833966a40e8f5a8f5554af0f812cfc5ad); /* branch */ 

c_0xa126c9f9(0x27162445addce6a83edb43b8630f49c28b7b3d6869c74d76e2d31c19cc6569d5); /* line */ 
            c_0xa126c9f9(0xae7b2da4f4ec7a09af015c3573798ecd2b7432ad0a6e70c64b3180dc007b9cf4); /* statement */ 
_vote(voteId, true, msg.sender, _executesIfDecided);
        }else { c_0xa126c9f9(0x1617dbe2c6c5063e543f2fe3042bdbe96be26f9729ab14f5630df623ab80ed36); /* branch */ 
}
    }

    function _vote(
        uint256 _voteId,
        bool _supports,
        address _voter,
        bool _executesIfDecided
    ) internal
    {c_0xa126c9f9(0x129fb2ed41d48c22e403a0efea3fde372ed3ce4a333b573e2108caa9465c3f6d); /* function */ 

c_0xa126c9f9(0xa1bfe5eb85b02e4532af57c2c10c247a35d1238fdc8e8bf367b6a1c8825a1740); /* line */ 
        c_0xa126c9f9(0xc08b1acd08bcfe1f661e179d59cb49196320e315e4b71b4617eef424f5fceef2); /* statement */ 
Vote storage vote_ = votes[_voteId];

        // This could re-enter, though we can assume the governance token is not malicious
c_0xa126c9f9(0x95d79bbeefc13d03e725a3bd8c1d628c2823291751492528e0d279b6238d3dfe); /* line */ 
        c_0xa126c9f9(0x21a253c204b5ada954ddbbb5dc141b951d05bd53c373897700e340c833519cbd); /* statement */ 
uint256 voterStake = api3Pool.balanceOfAt(_voter, vote_.snapshotBlock);
c_0xa126c9f9(0x8b1b4a3860045630afa29e2b176cf8fe14d5bd2e84e9ecbb81df5b3148b7d4c0); /* line */ 
        c_0xa126c9f9(0xe8f3375d356d490625b82da3846eadd900b0722fc9057e6e4ff72750e66196b2); /* statement */ 
VoterState state = vote_.voters[_voter];

        // If voter had previously voted, decrease count
c_0xa126c9f9(0xbbda085d58765f9bd49e30067fac11108dd244f80851a163b214d45e257d8564); /* line */ 
        c_0xa126c9f9(0x905666831e2233f300d62e24e33368cea5b5396607678eafe96c1cf0d1e2c9f8); /* statement */ 
if (state == VoterState.Yea) {c_0xa126c9f9(0xd87b0f806e134afb1139b57571696e2a7f6b6cbfc790469245005c1e1dcbdacf); /* branch */ 

c_0xa126c9f9(0xc12d5de0cbbb52a4638a4308f276d26459b639adebfa3a75fd641964f239321d); /* line */ 
            c_0xa126c9f9(0xac064fa8552a57426c70fda404d66a6762b63671319b9236e7553704b91cc639); /* statement */ 
vote_.yea = vote_.yea.sub(voterStake);
        } else {c_0xa126c9f9(0xd69d227d93ea323ebd5729401b34978c0da1f1cc22ac0da66b9453fe41f677d5); /* statement */ 
c_0xa126c9f9(0x067e62fd001dbc732df1273ff3be3cf8ebc259dc7caea8e9c7cdbeeaf6495164); /* branch */ 
if (state == VoterState.Nay) {c_0xa126c9f9(0xb41fb2df3b96eb14b397f4decc215a2c22a0ed2b10ac1faf0c172df00623818d); /* branch */ 

c_0xa126c9f9(0xe3669d1b1f0c70ca1b766019f242e722e1707376a636a1b12148af4868fedffe); /* line */ 
            c_0xa126c9f9(0x28380cb25ceeaa70781381fc6158ac2b5b29644705e11a65beda55d3996d8c67); /* statement */ 
vote_.nay = vote_.nay.sub(voterStake);
        }else { c_0xa126c9f9(0x6941f548d0905556c77717cea53e426092ad98093f68520615ab007d0744df6f); /* branch */ 
}}

c_0xa126c9f9(0x2e7397923d0bffc803d2a5cbf73455ff16e16af25b0ab5ca11cc9ad1db2bb641); /* line */ 
        c_0xa126c9f9(0xe1bfc725359843e0cc057cd8a11d8b04e5a74656af70e92c585c1a9354cd2814); /* statement */ 
if (_supports) {c_0xa126c9f9(0xcfb596dc280f0c89a1aca9a3945392611f99392cc234a743fe2c99d1583df74a); /* branch */ 

c_0xa126c9f9(0x9047688d86630f0ecca388ce02d333c6fed2cc8a09c5e52af9c921a2f581362f); /* line */ 
            c_0xa126c9f9(0xc5ed82dd99edf69a42cf2fbb1d705fcc2c93afb8ac73187971e9ee19a678c8c8); /* statement */ 
vote_.yea = vote_.yea.add(voterStake);
        } else {c_0xa126c9f9(0x4b67a18a1c6a17d7f2672a810b5fbdaaa08e435d27237694066892a75acac6e0); /* branch */ 

c_0xa126c9f9(0xf2668e92d9272e2a71005e4a2adcd2eb18add91f5ac386e41c933d9284708fd2); /* line */ 
            c_0xa126c9f9(0x3c5c07c04323b3d3341dcf42d32aa935e314466d962421a4d2309a21af7a65fb); /* statement */ 
vote_.nay = vote_.nay.add(voterStake);
        }

c_0xa126c9f9(0xe610b032df65f92cea2a70d466241741a1d916e8745800f626191ada72bce2b4); /* line */ 
        c_0xa126c9f9(0x3917ae6a7d1289e03ce2960d028cba7a9953b34ac9587e06b91a7ad708494c10); /* statement */ 
vote_.voters[_voter] = _supports ? VoterState.Yea : VoterState.Nay;

c_0xa126c9f9(0x8c1bb5fde1219d8928f894603e53c1e3d667f4e80345dfeb0fe4cbfebcdd01c5); /* line */ 
        c_0xa126c9f9(0x518899caed73584143a318368407537ef7f89e89037b3d86c144267da1feecc6); /* statement */ 
emit CastVote(_voteId, _voter, _supports, voterStake);

c_0xa126c9f9(0xb74376148eaf8a4e0e9da8645a983ba12bcf46b1661df946a4ee8e7a6019cdec); /* line */ 
        c_0xa126c9f9(0x49ab89feb2c9836bd18daeb79b32eb2fb6c4c5fc5a32f2a9e007a07f0f04937b); /* statement */ 
if (_executesIfDecided && _canExecute(_voteId)) {c_0xa126c9f9(0x33b74a0500738c0b2061060e57f086a790fddfb3ee09224e8fa868c0f02edad1); /* branch */ 

            // We've already checked if the vote can be executed with `_canExecute()`
c_0xa126c9f9(0xb48620f9a0a2e0ef50f857ceaf1f999353817927d6017296a01f2f21b59211c9); /* line */ 
            c_0xa126c9f9(0xe41b5104dca553ef3e7ddd2f620e33eaf75b07369691c3774d1061eacc86f221); /* statement */ 
_unsafeExecuteVote(_voteId);
        }else { c_0xa126c9f9(0x2d0f22bf5aa734d1a0417a005984c9c8ea77ada9fae2de90402e999f2e9702d0); /* branch */ 
}
    }

    function _executeVote(uint256 _voteId) internal {c_0xa126c9f9(0x6dfda70432742a670a1372c065d070811b67ac1180c2c39dae32e591eba3a605); /* function */ 

c_0xa126c9f9(0xc387e9e10678f588bd95e131f2d54c941c83c3fba7ff2dd0cce69ffa5df7c4f9); /* line */ 
        c_0xa126c9f9(0x22e67f3a2e52660b313f0d9e3e5760da36dd8c261d10faa5eeb52f3e0b1d8edd); /* requirePre */ 
c_0xa126c9f9(0xf507ea87d407d70cf7adc2fdf0e7a71e4758b1124c063068cdbd9cd008521a5e); /* statement */ 
require(_canExecute(_voteId), ERROR_CAN_NOT_EXECUTE);c_0xa126c9f9(0xf6930d9d4e17d4799bd2816058b443f3e956fe972750edd0957a61721677c9f2); /* requirePost */ 

c_0xa126c9f9(0xb7127a2a5654f74d9ccb71660f94b6f54d6e59fad4ea299cea4931c85d47c117); /* line */ 
        c_0xa126c9f9(0xf10673793a359ced94512c12c1d45dcb7857704e541cde2342b6dd6023168a52); /* statement */ 
_unsafeExecuteVote(_voteId);
    }

    /**
    * @dev Unsafe version of _executeVote that assumes you have already checked if the vote can be executed
    */
    function _unsafeExecuteVote(uint256 _voteId) internal {c_0xa126c9f9(0x748868084148fd03cbb66df25519563f2054a6fc8cb2fa557ed217cb0841be92); /* function */ 

c_0xa126c9f9(0x6403e3db12878363bd92dfe9bb8910f24bdb8b85e03680ca7199e1c86ea557fd); /* line */ 
        c_0xa126c9f9(0x80d698569777f42d0906c39255df73c53535b939a9dc51b02cf865ef282d22d8); /* statement */ 
Vote storage vote_ = votes[_voteId];

c_0xa126c9f9(0x1835321aa4d70d3a53e0f120fcb6422275f4f390fe5517ed3e800b3889d9b9c7); /* line */ 
        c_0xa126c9f9(0xc039459adbbad7a5adeddf4a0044fb2b8c0b89ad777ef930258bb4e65f19bbd6); /* statement */ 
vote_.executed = true;

c_0xa126c9f9(0x1e34142e778bd539c267f4496413a09eed2e939afdbad5ebdade45d625f99255); /* line */ 
        c_0xa126c9f9(0xe0ce284a0f5875af5d395d37d2ee8ebfb488c5fdee2f74e7b74cbe98b725bc43); /* statement */ 
bytes memory input = new bytes(0); // TODO: Consider input for voting scripts
c_0xa126c9f9(0x83391f6d731c2056d42de2af1fe6fb0504e40a2f91fe54a29911520f05c8780b); /* line */ 
        c_0xa126c9f9(0x65102f47fd04be4a526845f2715562ac6bd5e56f4f9aaac9dca6e6da4f84fe1b); /* statement */ 
runScript(vote_.executionScript, input, new address[](0));

c_0xa126c9f9(0x29643e06d6a8c9d2f34a0854faa8bfa03175628ecb0529e789d72aa45c06420d); /* line */ 
        c_0xa126c9f9(0x9a1e3dceaa392f2f8ba89536a253c3cc554281d79c5d2c73a91446c739a44d08); /* statement */ 
emit ExecuteVote(_voteId);
    }

    function _canExecute(uint256 _voteId) internal view returns (bool) {c_0xa126c9f9(0xd9dd92b59c1fae549cb88c64d1b49c727574bb5f10d247efdb596397093ae37f); /* function */ 

c_0xa126c9f9(0x07c046799c1d6a0734d7122d9d56b3d9a7fa3ecf22f87a342a9feb909bef9e3f); /* line */ 
        c_0xa126c9f9(0xccd40b8a018a06f5aa60007cc9aba0f648a5978a7bbfae881a8f559eff3fc30a); /* statement */ 
Vote storage vote_ = votes[_voteId];

c_0xa126c9f9(0xdbc2c91ea9da8e9aba8c7398b93ae072ded4975050f2a2f6dec24b0a89d73444); /* line */ 
        c_0xa126c9f9(0x8a2a9c555b4dd38ef7cf419f879f8166b0a1e9b8643b3d332deb188fbceac577); /* statement */ 
if (vote_.executed) {c_0xa126c9f9(0x680e6b10be704530299179d8a55ede55ac05ce7bb2da600c7648c114c6d823df); /* branch */ 

c_0xa126c9f9(0xf80ff7f6923bfa3b670ae84604a9e42f3f29e9e9395d31ee70e501e25eb49a90); /* line */ 
            c_0xa126c9f9(0x01c27684e5fd5caf9ea44a15b907b598829577ee33ab4c88689fbc7045032920); /* statement */ 
return false;
        }else { c_0xa126c9f9(0xb52c5d671316ba6f69389e2d09d089244ebe1bf3f4a0b20cfb1556c1e0308ba0); /* branch */ 
}

        // Voting is already decided
c_0xa126c9f9(0xf8a66c55a39ed84a3d244baa4c3f6e428b5b5cbee9e289ff8e56e359b8578987); /* line */ 
        c_0xa126c9f9(0x15ae779374248ae197f7b31372fd13e94472d543dac1d3702f78749786cb5ff1); /* statement */ 
if (_isValuePct(vote_.yea, vote_.votingPower, vote_.supportRequiredPct)) {c_0xa126c9f9(0xa78fff2448a9aab171ec8b17aaf7e26c32c1c859cc713c4fc42dd142e894586e); /* branch */ 

c_0xa126c9f9(0x054906f6feec2c10612f9c6f4a5305c548aa36e1ac5c88c746d0527921ef35ef); /* line */ 
            c_0xa126c9f9(0xaa8d6c3911c547467a4cd11eea06f4b1d6d8c6a5fb16f258521f6fed160ce165); /* statement */ 
return true;
        }else { c_0xa126c9f9(0xa5c4514b94a3ddb672dc7c03f99e5249e40b3ea39d597e13443b269201dc7aa5); /* branch */ 
}

        // Vote ended?
c_0xa126c9f9(0x9aa08b384bdf0abe91d4499709e916e2164ac96da4576a5c62e19dedc805662b); /* line */ 
        c_0xa126c9f9(0x4cc47a7dde4b1e1b7585026fc495b5df400a704298f5a0bba7b5cee63a6593f7); /* statement */ 
if (_isVoteOpen(vote_)) {c_0xa126c9f9(0xb60332c5860a9951fe7d0dbedbea7eebc484ac4878771f2568f8639ac4b7633d); /* branch */ 

c_0xa126c9f9(0x840929e767ae63c624bf02710e5853420b32ab5f6597386e0e749616949875d7); /* line */ 
            c_0xa126c9f9(0x4722135ed999fa5c28bcfb7c61ecb8c0f200490693211fa1030db8eff1419d4e); /* statement */ 
return false;
        }else { c_0xa126c9f9(0x4ddfa9ccada3316e9f9eb224c517436aa5880e39d1ce5217b27980ce7377f4fd); /* branch */ 
}
        // Has enough support?
c_0xa126c9f9(0x0862f7abae9676ebffce543f9a1bbab2c0a5877fd6213b77bdcb4ced62662cd3); /* line */ 
        c_0xa126c9f9(0xaa988473885358ca6b8db6b46208830ee6a30a4ba40dbe1924b56707aa8e7dc0); /* statement */ 
uint256 totalVotes = vote_.yea.add(vote_.nay);
c_0xa126c9f9(0x6ad4b313ad799d2780f3bba40194b1afa699a82bb219f8ae27f696d7043784ec); /* line */ 
        c_0xa126c9f9(0xe63917cf8be2cab54d889e271ce7a563a0082a8a7a2ddb1eb085ba861a9e6d69); /* statement */ 
if (!_isValuePct(vote_.yea, totalVotes, vote_.supportRequiredPct)) {c_0xa126c9f9(0x9860dc8d06b8e02f0e28b8f37063e76dbfdbcb174e999868ca3bded60d2252ad); /* branch */ 

c_0xa126c9f9(0xce235671bb7da77869290c624bf356fcbe406c5aea00ecb90b98c245504f74f0); /* line */ 
            c_0xa126c9f9(0x5f770191603455bec680494476fc7c03a00c6e01fdf77b225e5d13818b5f5b4e); /* statement */ 
return false;
        }else { c_0xa126c9f9(0xf748aa2aa5edbf05f599ecff2a4f859b7a343fd0c6ba4283b7f78e4f4f4927f8); /* branch */ 
}
        // Has min quorum?
c_0xa126c9f9(0xb7a630769331ab3cbdddba328b473a0704ddbb01c5e7defabc196ce58c702690); /* line */ 
        c_0xa126c9f9(0x798560cddc75a95e82109e1f7f8353c75161749c2b591e96b21ce92b0b0091a4); /* statement */ 
if (!_isValuePct(vote_.yea, vote_.votingPower, vote_.minAcceptQuorumPct)) {c_0xa126c9f9(0xe213b4af27dd610da9ad9b15e4ff846bd5aa77bcbf614e54419a6665c97cdcdd); /* branch */ 

c_0xa126c9f9(0x98f706fb542b9bc05698fbec80c31305a66975ec17d44383333a5e797065ff32); /* line */ 
            c_0xa126c9f9(0xe3412e831c48b9bdd2c9378a2c476ce5efc68f1c1e76a69bf46cf0a2b701b66e); /* statement */ 
return false;
        }else { c_0xa126c9f9(0xe5c2968d6104e3d1d0a2fb989200197ff3a398dbf1e71d43233822c32d8b8255); /* branch */ 
}

c_0xa126c9f9(0x88ece6d9d719d569a352421b59984dccad2a2b041f078c8d71a14542f4ba38a6); /* line */ 
        c_0xa126c9f9(0x4fc493bf1cfc0e1b1f5cc22b3a5e90b326c07edd8615865d0b0c5a254790ec7b); /* statement */ 
return true;
    }

    function _canVote(uint256 _voteId, address _voter) internal view returns (bool) {c_0xa126c9f9(0xa6fd5db4a4616aaf2907bf567aa26bfb8633b283ef227d4087e3fceade8d9c87); /* function */ 

c_0xa126c9f9(0xf8e817431f0bad2b0c45bc34cb397fe06b01e391ca08bcfb493161a5e1838282); /* line */ 
        c_0xa126c9f9(0x89124622aadebbc80c6302b394f44b0cc2e5d28c4a80126c1fd630a0a8af4c1e); /* statement */ 
Vote storage vote_ = votes[_voteId];

c_0xa126c9f9(0x2a5182adfc6d5ee5d5d49b6a6219cffc82b2985dfb109e2d3009bc740368fa74); /* line */ 
        c_0xa126c9f9(0x1a7bdf72a5517fce7b399a9bd574fdf449e1ca6567b4b80681138e3b1b03c454); /* statement */ 
return _isVoteOpen(vote_) && api3Pool.balanceOfAt(_voter, vote_.snapshotBlock) > 0;
    }

    function _isVoteOpen(Vote storage vote_) internal view returns (bool) {c_0xa126c9f9(0x796581b8d9a8849caee7d68fe10b5c8f30eec377fa1f19c0b089e8af651efdf7); /* function */ 

c_0xa126c9f9(0xaffa139cc979731e0a631547bbf92b62149778704dff89a3eefd301e73ae8d53); /* line */ 
        c_0xa126c9f9(0x9f704b7d585bbd26599c165b14e45382861bc081bcbba37f452f17c6253bceaa); /* statement */ 
return getTimestamp64() < vote_.startDate.add(voteTime) && !vote_.executed;
    }

    /**
    * @dev Calculates whether `_value` is more than a percentage `_pct` of `_total`
    */
    function _isValuePct(uint256 _value, uint256 _total, uint256 _pct) internal pure returns (bool) {c_0xa126c9f9(0x133ad77152e975969aa86e207c820ec9823dc01be8ca142555aab37c5738a0a6); /* function */ 

c_0xa126c9f9(0x78e35d8ae657e07f5124eca244ac3f22cef9dc7cde0bc776bab37d681a7444a9); /* line */ 
        c_0xa126c9f9(0x554c2ad3e6648187823d389c9da3622c67b9ff758aebf61a3ab68393088236de); /* statement */ 
if (_total == 0) {c_0xa126c9f9(0xecf6ecc8a0cd5c39032de96e80acba03180621c1fb4fb09af1b5020bdc0f466c); /* branch */ 

c_0xa126c9f9(0x5fb39319683997b595cdb7fd01ed8ec41bb2ddf18a3d4f268a82501cfc0bd6e3); /* line */ 
            c_0xa126c9f9(0xf012be6c85c5f963eb2c9a5d594e0dcca1e8780f3ed9be30ded681e1c9a6fe35); /* statement */ 
return false;
        }else { c_0xa126c9f9(0x40f9283e8995e8c9e5fdf15f047db862516bd7c185e388c2bc6f60077256ac84); /* branch */ 
}

c_0xa126c9f9(0x5dcb0a6a188809db3158b0068dc60d8c63efc1279522ca46943f76f6b012287b); /* line */ 
        c_0xa126c9f9(0x2e09b6210c73dbaa96da5e1d15fb9e6a187b981ab2e7a42e4268ad05be390d1c); /* statement */ 
uint256 computedPct = _value.mul(PCT_BASE) / _total;
c_0xa126c9f9(0x4b414a0ab17a0e8b1a5905d3acde60c5535900fc1d0a42d6206f5add300ad77d); /* line */ 
        c_0xa126c9f9(0xe47fa972c1d458d625463ae630da900a27ebda8b59e0e1e698fe971d92f86cc2); /* statement */ 
return computedPct > _pct;
    }
}
