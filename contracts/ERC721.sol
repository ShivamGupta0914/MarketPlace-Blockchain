// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IERC721.sol";

contract ERC721Token is IERC721 {
    mapping(uint256 => address) owner;
    mapping(uint256 => address) approved;
    mapping(address => uint256) balance;
    mapping(address => mapping(address => bool)) approvalForAll;

    constructor() {
        owner[0] = msg.sender;
        owner[1] = msg.sender;
        balance[msg.sender] = 2;
    }

    function balanceOf(address _owner) external view returns (uint256) {
        return balance[_owner];
    }

    function ownerOf(uint256 _tokenId) external view returns (address) {
        return owner[_tokenId];
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) external {
        _safetransferFrom(_from, _to, _tokenId, _data);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external {
        _safetransferFrom(_from, _to, _tokenId, "");
    }

    function _safetransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) internal {
        _transferFrom(_from, _to, _tokenId);
        uint256 size;
        assembly {
            size := extcodesize(_to)
        }
        require(size > 0, "_to is not a contract account");
        bytes4 returnData = IERC721Receiver(_to).onERC721Received(
            msg.sender,
            _from,
            _tokenId,
            _data
        );
        require(
            returnData ==
                bytes4(
                    keccak256("onERC721Received(address,address,uint256,bytes)")
                ),
            "_to contract does not implement ERC721Received"
        );
        emit Transfer(_from, _to, _tokenId);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external {
        _transferFrom(_from, _to, _tokenId);
    }

    function _transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal {
        require(
            msg.sender == _from ||
                approvalForAll[_from][msg.sender] == true ||
                approved[_tokenId] == msg.sender,
            "can not send token"
        );
        require(owner[_tokenId] == _from, "no such token available");
        delete approved[_tokenId];
        owner[_tokenId] = _to;
        balance[_from] -= 1;
        balance[_to] += 1;
        emit Transfer(_from, _to, _tokenId);
    }

    function approve(address _approved, uint256 _tokenId) external {
        require(_approved != address(0), "can not approve zero address");
        approved[_tokenId] = _approved;
        emit Approval(msg.sender, _approved, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved) external {
        require(_operator != address(0), "can not approve zero address");
        approvalForAll[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function getApproved(uint256 _tokenId) external view returns (address) {
        return approved[_tokenId];
    }

    function isApprovedForAll(address _owner, address _operator)
        external
        view
        returns (bool)
    {
        return approvalForAll[_owner][_operator];
    }
}

contract B is IERC721Receiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }
}
