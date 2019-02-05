var ProductList = artifacts.require('ProductList');

contract('ProductList', (accounts) =>{
	var seller = accounts[1];
	var buyer = accounts[2];
	var itemName = 'Item 1';
	var description = 'Description 1';
	var price = web3.utils.toWei('10', 'ether');
	var instance;
	//If an item doesnt have a seller, it isnt for sale
	it("should throw an error if you try to buy an item that isnt for sale", ()=>{
		return ProductList.deployed().then(i => {
			instance = i;
			return instance.buyItem({from:seller, value: price});
		}).then(assert.fail)//It's definitely gonna fail here since no item has been sold in this contract
							//We use assert.fail cos we are expecting a failed response. I dont fully grasp this yet
		.catch(error =>{
			assert(true)//This is how you handle assertions of things you want to fail
		}).then(() =>{
			return instance.getItem();
		}).then(data =>{//Check that the state wasnt change despite the failed buy
			assert.equal(data[0], 0x0, "Seller address must be empty");
			assert.equal(data[1], 0x0, "Buyer address must be empty");
			assert.equal(data[2], "", "Item name must be empty");
			assert.equal(data[3], "", "Item description must be empty");
			assert.equal(data[4].toNumber(), 0, `Item price must be 0`);
		})
	});

	it("should throw an error when you try buying your own item", () =>{
		return ProductList.deployed().then(i =>{
			instance = i;
			//You should first sell an item first before it's available for purchase
			return instance.sellItem(itemName, description, price, {from: seller});
		}).then(receipt =>{
			return instance.buyItem({from: seller, value:price});//Try buying
		}).then(assert.fail)//fail at it
		.catch(error => assert(true))
		.then(() => {return instance.getItem()})//Get the current state of things in the contract
		.then(data =>{//Check if the state didnt change
			assert.equal(data[0], seller, "Seller address must be "+ seller);
			assert.equal(data[1], 0x0, "Buyer address must be empty at this point");
			assert.equal(data[2], itemName, "Item name must be " + itemName);
			assert.equal(data[3], description, "Item description must be "+ description);
			assert.equal(data[4], price, `Item price must be ${price}`);
		})
	});

	it("should throw an error when you try buying an item for a value different from the price", () =>{
		return ProductList.deployed().then(i =>{
			instance = i;
			return instance.buyItem({from: seller, value:price + 1});//Try buying at a different price
		}).then(assert.fail)//fail at it
		.catch(error => assert(true))
		.then(() => {return instance.getItem()})//Get the current state of things in the contract
		.then(data =>{//Check if the state didnt change
			assert.equal(data[0], seller, "Seller address must be "+ seller);
			assert.equal(data[1], 0x0, "Buyer address must be empty at this point");
			assert.equal(data[2], itemName, "Item name must be " + itemName);
			assert.equal(data[3], description, "Item description must be "+ description);
			assert.equal(data[4], price, `Item price must be ${price}`);
		})
	});

	it("should throw an error when you try buying an item thats already been sold", () =>{
		return ProductList.deployed().then(i =>{
			instance = i;
			// Buy an item first
			return instance.buyItem({from: buyer, value:price});
		}).then(receipt =>{
			return instance.buyItem({from: buyer, value:price});//Try buying again
		}).then(assert.fail)//fail at it
		.catch(error => assert(true))
		.then(() => {return instance.getItem()})//Get the current state of things in the contract
		.then(data =>{//Check if the state didnt change
			assert.equal(data[0], seller, "Seller address must be "+ seller);
			assert.equal(data[1], buyer, "Buyer address must be " + buyer);
			assert.equal(data[2], itemName, "Item name must be " + itemName);
			assert.equal(data[3], description, "Item description must be "+ description);
			assert.equal(data[4], price, `Item price must be ${price}`);
		})
	});

})