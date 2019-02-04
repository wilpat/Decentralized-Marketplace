pragma solidity ^0.5.0;

contract ProductList{

	address payable seller;
	address buyer;
	string name;
	string description;
	uint256 price;

	event itemSold(address indexed _seller, string _name, uint256 _price);
	event itemBought(address indexed _buyer, address indexed _seller, string _name, uint256 _price);
	// constructor() public{
	// 	sellItem('default item', 'description for default item', 1000000000000	000000);
	// }

	function sellItem (string memory _name, string memory _description, uint256 _price) public {
		seller = msg.sender;
		name = _name;
		description = _description;
		price = _price;
		emit itemSold(seller, _name, _price);
	}
	
	function getItem () public view returns(
		address _seller,
		address _buyer,
		string memory _name,
		string memory _description,
		uint256 _price
	){
		return (seller, buyer, name, description, price);
	}
	
	function buyItem () public payable {//payable meaning this fxn may receive ether from it's caller
		
		require (seller != address(0x0));//This item has a seller
		
		require (buyer == address(0x0));////This itemm hasnt been sold

		require (msg.sender != seller); // The buyer isnt the seller

		require (msg.value == price); //Amount sent is the price of this item

		buyer = msg.sender;//Store the buyer

		seller.transfer(msg.value);//transfer funds

		//trigger event
		emit itemBought(buyer, seller, name, price);
	}
	
	
}
