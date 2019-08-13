# Universal Recievers (WIP)

This folder contains research relating to universal recievers, a mechanism to notify contracts of incoming transactions.


### Bare Reciever
```solidty
interface BareReciever {
    event Received(bytes32 typeId , bytes data);
    function recieve(bytes32 typeId ,bytes calldata data) external;
}
```
The bare reciever accepts only a typeId, which determines the type of the recieving(token,NFT,etc) and a byte array with the information. In the bare reciever, the implementing contract takes care of decoding parameters, which can only be done efficiently using inline assembly.

### Typed Reciever
```solidity
interface TypedReciever {
    event Recieved(bytes32 typeId , address from, address to, uint256 amount, bytes data);
    function recieve(bytes32 typeId , address from, address to, uint256 amount, bytes calldata data) external;
}
```  
In the typed reciver, some basic parameter are already baked into the standard and the implementing contract doesn't need to do much work.

#### Benchmarking gas consumption

Two very basic contracts were defined: `BasicBareReciever.sol` and `BasicTypedReciever.sol`. Each one recieves a function and emits an event `TokenRecieved(address from, address to, uint256 amount)`

Gas consumed:
`BasicBareReciever.sol`: `30441`

`BasicTypedReciever.sol`: `30892`
