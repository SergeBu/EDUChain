pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

contract MyToken is ERC20, IVotes {
    struct Checkpoint {
        uint32 fromBlock;
        uint224 votes;
    }
    
    bytes32 public constant DELEGATION_TYPEHASH = 
        keccak256("Delegation(address delegatee,uint256 nonce,uint256 expiry)");
    
    mapping(address => uint256) public nonces;
    mapping(address => address) private _delegates;
    mapping(address => Checkpoint[]) public checkpoints;
    mapping(address => uint32) public numCheckpoints;
    Checkpoint[] public totalSupplyCheckpoints;

    function safe32(uint256 n) internal pure returns (uint32) {
        require(n <= type(uint32).max, "block number > 32 bits");
        return uint32(n);
    }

    constructor() ERC20("MyToken", "MTK") {}
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
    
    // Implement IVotes interface
    function getVotes(address account) public view override returns (uint256) {
        uint256 pos = checkpoints[account].length;
        return pos == 0 ? 0 : checkpoints[account][pos - 1].votes;
    }
    
    function getPastVotes(address account, uint256 blockNumber) public view override returns (uint256) {
        require(blockNumber < block.number, "Block not yet mined");
        uint256 nCheckpoints = checkpoints[account].length;
        if (nCheckpoints == 0) return 0;
        
        // First check most recent checkpoint
        if (checkpoints[account][nCheckpoints - 1].fromBlock <= blockNumber) {
            return checkpoints[account][nCheckpoints - 1].votes;
        }
        
        // Next check implicit zero
        if (checkpoints[account][0].fromBlock > blockNumber) {
            return 0;
        }

        uint256 lower = 0;
        uint256 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint256 center = upper - (upper - lower) / 2;
            Checkpoint memory cp = checkpoints[account][center];
            if (cp.fromBlock == blockNumber) {
                return cp.votes;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return checkpoints[account][lower].votes;
    }   
    
    function delegates(address account) public view override returns (address) {
        return _delegates[account];
    }
    
    function delegate(address delegatee) public override {
        _delegate(msg.sender, delegatee);
    }
    
    function delegateBySig(
        address delegatee,
        uint256 nonce,
        uint256 expiry,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(block.timestamp <= expiry, "Signature expired");
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name())),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
        bytes32 structHash = keccak256(
            abi.encode(
                DELEGATION_TYPEHASH,
                delegatee,
                nonce,
                expiry
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        address signer = ecrecover(digest, v, r, s);
        require(signer != address(0), "Invalid signature");
        require(nonce == nonces[signer]++, "Invalid nonce");
        _delegate(signer, delegatee);
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name())),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }   
    
    function getPastTotalSupply(uint256 blockNumber) public view override returns (uint256) {
        require(blockNumber < block.number, "Only past blocks");
        uint256 nCheckpoints = totalSupplyCheckpoints.length;
        if (nCheckpoints == 0) return 0;

        if (totalSupplyCheckpoints[nCheckpoints - 1].fromBlock <= blockNumber) {
            return totalSupplyCheckpoints[nCheckpoints - 1].votes;
        }

        if (totalSupplyCheckpoints[0].fromBlock > blockNumber) {
            return 0;
        }

        uint256 lower = 0;
        uint256 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint256 center = upper - (upper - lower) / 2;
            Checkpoint memory cp = totalSupplyCheckpoints[center];
            if (cp.fromBlock == blockNumber) {
                return cp.votes;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return totalSupplyCheckpoints[lower].votes;
    }
    
    // Internal functions
    function _delegate(address delegator, address delegatee) internal {
        address currentDelegate = delegates(delegator);
        _delegates[delegator] = delegatee;
        _moveDelegates(currentDelegate, delegatee, balanceOf(delegator));
    }
    

     
 
    function _subtract(uint256 a, uint256 b) private pure returns (uint256) {
        return a - b;
    }
    


// src/MyToken.sol

// src/MyToken.sol

function _add(uint256 a, uint256 b) private pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a, "addition overflow");
    return c;
}

function _writeTotalSupplyCheckpoint(
    function(uint256, uint256) view returns (uint256) op,
    uint256 delta
) private {
    uint256 pos = totalSupplyCheckpoints.length;
    uint256 oldSupply = pos == 0 ? 0 : totalSupplyCheckpoints[pos - 1].votes;
    uint256 newSupply = op(oldSupply, delta);
    
    if (pos > 0 && totalSupplyCheckpoints[pos - 1].fromBlock == block.number) {
        totalSupplyCheckpoints[pos - 1].votes = uint224(newSupply);
    } else {
        totalSupplyCheckpoints.push(Checkpoint({
            fromBlock: safe32(block.number),
            votes: uint224(newSupply)
        }));
    }
}

function _writeCheckpoint(
    address account,
    function(uint256, uint256) view returns (uint256) op,
    uint256 delta
) private {
    uint256 pos = checkpoints[account].length;
    uint256 oldVotes = pos == 0 ? 0 : checkpoints[account][pos - 1].votes;
    uint256 newVotes = op(oldVotes, delta);
    
    require(newVotes <= type(uint224).max, "votes overflow");
    
    if (pos > 0 && checkpoints[account][pos - 1].fromBlock == block.number) {
        checkpoints[account][pos - 1].votes = uint224(newVotes);
    } else {
        checkpoints[account].push(Checkpoint({
            fromBlock: safe32(block.number),
            votes: uint224(newVotes)
        }));
    }
}
function burn(uint256 amount) public {
    _burn(msg.sender, amount);
}
// src/MyToken.sol

function _update(address from, address to, uint256 value) internal override {
    super._update(from, to, value);
    
    // Получаем текущих делегатов до обновления
    address fromDelegate = delegates(from);
    address toDelegate = delegates(to);
    
    // Обновляем делегирование только если не будет переполнения
    _moveDelegates(fromDelegate, toDelegate, value);
    
    // Обновляем общее предложение
    if (from == address(0)) {
        _writeTotalSupplyCheckpoint(_add, value);
    } else if (to == address(0)) {
        _writeTotalSupplyCheckpoint(_subtract, value);
    }
}

function _moveDelegates(address src, address dst, uint256 amount) private {
    if (src != dst && amount > 0) {
        if (src != address(0)) {
            uint256 oldVotes = getVotes(src);
            require(oldVotes >= amount, "insufficient votes for subtraction");
            _writeCheckpoint(src, _subtract, amount);
        }
        if (dst != address(0)) {
            uint256 newVotes = getVotes(dst) + amount;
            require(newVotes <= type(uint224).max, "votes overflow");
            _writeCheckpoint(dst, _add, amount);
        }
    }
}
}