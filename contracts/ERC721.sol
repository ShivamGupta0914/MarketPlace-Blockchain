//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Token is ERC721 {
    address private owner;

    constructor() ERC721("MyToken", "MTK") {
        owner = msg.sender;
    }

    function mint(address to, uint256 id) external {
        _safeMint(to, id);
    }
}
