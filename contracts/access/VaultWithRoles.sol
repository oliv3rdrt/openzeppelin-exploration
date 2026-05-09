// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// Experimenting with multi-role access — replacing Ownable in a treasury-style contract
contract VaultWithRoles is AccessControl {
    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");
    bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function deposit() external payable onlyRole(DEPOSITOR_ROLE) {
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(address payable to, uint256 amount) external onlyRole(WITHDRAWER_ROLE) {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
        emit Withdrawn(to, amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
