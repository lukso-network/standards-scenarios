// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.7.0;

/**
 * @notice ERC-1271: Standard Signature Validation Method for Contracts
 */
interface IERC1271 {

//    bytes4 internal constant _ERC1271MAGICVALUE = 0x20c13b0b;
//    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;

    /**
     * @dev Should return whether the signature provided is valid for the provided data
     * @param _hash hash of the data signed//Arbitrary length data signed on the behalf of address(this)
     * @param _signature Signature byte array associated with _data
     *
     * @return magicValue either 0x20c13b0b on success or 0xffffffff failure
     */
    function isValidSignature(
        bytes32 _hash, //bytes memory _data,
        bytes memory _signature
    )
    external
    view
    returns (bytes4 magicValue);
}
