// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BreakMonad is ERC721URIStorage, Ownable {
    uint256 public tokenId;
    uint256 public monadId;
    using SafeMath for uint256;
    mapping(address => MonadStats) private monadStastics;
    uint256 public immutable ENTRY_FEE = 500000000000000 wei;
    uint256 public immutable WIN_POINT = 10;
    uint256 public immutable LOSS_POINT = 5;
    MonadStats[] private monadStatsClub;
    struct MonadStats {
        uint256 points;
        uint256 losses;
        uint256 winnings;
        address user;
    }
    constructor(string memory _collectionName, string memory _collectionSymbol)
        Ownable(msg.sender)
        ERC721(_collectionName, _collectionSymbol)
    {}

    function playGame() external payable {
        require(msg.value >= ENTRY_FEE, "INSUFFICIENT_FUNDS");
        monadStastics[msg.sender] = MonadStats({
            points:0,
            losses:0,
            winnings:0,
            user:msg.sender
        });
    }

    function endGame(
        bool _isWin,
        string memory _tokenUri,
        address recipient
    ) external onlyOwner {
        MonadStats storage _monadStats = monadStastics[recipient];
        if (_isWin) {
            _monadStats.winnings = _monadStats.winnings.add(1);
            _monadStats.points = _monadStats.points.add(WIN_POINT);
        } else {
            _monadStats.losses = _monadStats.losses.add(1);
            _monadStats.points = _monadStats.points.sub(LOSS_POINT);
        }
        if (_monadStats.user == address(0)) {
            _monadStats.user = recipient;
        }

        (uint256 _index, bool _status) = _toFindMonadStatIndex(recipient);
        if (_status) {
            monadStatsClub[_index] = _monadStats;
        } else {
            monadStatsClub.push(_monadStats);
            unchecked {
                monadId++;
            }
        }

        unchecked {
            tokenId++;
        }
        uint256 newItemId = tokenId;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, _tokenUri);
    }

    function _toFindMonadStatIndex(address _recipient)
        private
        view
        returns (uint256, bool)
    {
        for (uint256 i = 0; i < monadId; ) {
            if (monadStatsClub[uint256(i)].user == _recipient) {
                return (i, true);
            }
            unchecked {
                i++;
            }
        }

        return (0, false);
    }

    function getStats() external view returns (MonadStats memory) {
        return monadStastics[msg.sender];
    }

    function transferMoney() external payable onlyOwner {
        (bool sent, bytes memory data) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(sent, "Failed to send Ether");
    }

    function getMonadStatsClub() view external returns(MonadStats[] memory){
        return monadStatsClub;
    }

    receive() external payable {}
}
