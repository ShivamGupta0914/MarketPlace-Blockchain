//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
contract ERC1155Token is ERC1155 {
    address private owner;
    constructor() ERC1155("") {
        owner = msg.sender;
    }

    function mint(address to, uint256 id, uint256 amount) external  {
        _mint(to, id, amount, "");
    }
} 