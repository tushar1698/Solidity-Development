// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity =0.8.18;

import "./BaseToken.sol";

contract esToken is BaseToken {
    constructor() ERC20("esToken", "esTOKEN") {}
}
