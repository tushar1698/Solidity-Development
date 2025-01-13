// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity =0.8.18;

import "./MintableToken.sol";

contract Token is MintableToken {
    constructor() ERC20("Token", "TOKEN") {}
}
