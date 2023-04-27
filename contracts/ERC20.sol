//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "./IERC20.sol";

contract TokenImplement is IERC20 {
    uint256 private tokenSupply = 1000 * (10**18);
    address private _owner;
    string private tokenName;
    string private tokenSymbol;
    mapping(address => uint256) private tokenBalance;
    mapping(address => mapping(address => uint256)) private approvalBalance;

    constructor(string memory _name, string memory _symbol) {
        tokenName = _name;
        tokenSymbol = _symbol;
        _owner = msg.sender;
        tokenBalance[_owner] = tokenSupply;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "can not send tokens to zero address");
        require(tokenBalance[msg.sender] >= amount, "Insufficient amount");
        tokenBalance[msg.sender] -= amount;
        tokenBalance[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function mint(address account, uint256 amount) external {
        // require(msg.sender == _owner, "not authorized to mint");
        require(
            account != address(0),
            "Cannot mint tokens to the zero address"
        );
        tokenSupply += amount;
        tokenBalance[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function burn(address account, uint256 amount) external {
        require(msg.sender == _owner, "not authorized to burn");
        require(tokenBalance[account] >= amount, "Not enough balance");
        tokenBalance[account] -= amount;
        tokenSupply -= amount;
        emit Transfer(account, address(0), amount);
    }

    function burnFrom(address from, uint256 amount) external {
        require(approvalBalance[_owner][msg.sender] >= amount, "you are not approved or Low Approval Balance");
        require(from != address(0), "can not burn from zero address");
        require(tokenBalance[from] >= amount, "Insufficient funds in from account");
        approvalBalance[_owner][msg.sender] -= amount;
        tokenBalance[from] -= amount;
        tokenSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        require(msg.sender != spender, "Can not approve Yourself");
        approvalBalance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(from != address(0) && to != address(0), "can not transfer or send to zero address");
        require(from != to, "same from and to");
        require(
            tokenBalance[from] >= amount,
            "from does not have sufficient balance"
        );
        require(
            approvalBalance[from][msg.sender] >= amount,
            "Not Authorized Or Insufficient Balance"
        );
        approvalBalance[from][msg.sender] -= amount;
        tokenBalance[from] -= amount;
        tokenBalance[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function totalSupply() external view returns (uint256) {
        return tokenSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return tokenBalance[account];
    }

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256) {
        return approvalBalance[owner][spender];
    }

    function name() external view returns (string memory) {
        return tokenName;
    }

    function symbol() external view returns (string memory) {
        return tokenSymbol;
    }
}