pragma solidity >=0.5.0;
contract Owner {

    address payable owner;
    constructor() public { 
    	owner = msg.sender; 
    }

    // This contract only defines a modifier but does not use
    // it: it will be used in derived contracts.
    // The function body is inserted where the special symbol
    // `_;` in the definition of a modifier appears.
    // This means that if the owner calls this function, the
    // function is executed and otherwise, an exception is
    // thrown.
    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        _;//A placeholder for the function that would use this modifier
    }
}