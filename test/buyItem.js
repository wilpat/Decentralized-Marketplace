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
			return instance.buyItem(1, {from:seller, value: price});
		}).then(assert.fail)//It's definitely gonna fail here since no item has been sold in this contract
							//We use assert.fail cos we are expecting a failed response. I dont fully grasp this yet
		.catch(error =>{
			assert(true)//This is how you handle assertions of things you want to fail
		}).then(() =>{
			return instance.getNumberOfItems();
		}).then(data =>{//Check that the state wasnt change despite the failed buy
			assert.equal(data.toNumber(), 0)//there should be no item yet
		})
	});

	it("should throw an error when you try to buy an item that doesn't exist", () =>{
		return ProductList.deployed().then(i =>{
			instance = i;
			//You should first sell an item first before it's available for purchase
			return instance.sellItem(itemName, description, price, {from: seller});
		})
		.then(receipt =>{
			return instance.buyItem(2, {from: seller, value:price});//Try buying item with id 2
		})
		.then(assert.fail)
		.catch(error => assert(true))
		.then(() =>{
			return instance.items(1);//Return the sold item (with id 1) to check if it hasn't been sold
		})
		.then(data =>{
			assert.equal(data[0], 1, "Id of the sold item must be 1");
			assert.equal(data[1], seller, "Seller address must be "+ seller);
			assert.equal(data[2], 0x0, "Buyer address must be empty at the point of posting item for sale");
			assert.equal(data[3], itemName, "Item name must be " + itemName);
			assert.equal(data[4], description, "Item description must be " + description);
			assert.equal(data[5], price, `Item price must be ${price}`);
		});
	});

	it("should throw an error when you try buying your own item", () =>{
		return ProductList.deployed().then(i =>{
			instance = i;
			//Since we sold an item already
			return instance.buyItem(1, {from: seller, value:price});//Try buying
		})
		.then(assert.fail)//fail at it
		.catch(error => {
			assert(true);
		})
		.then(() =>{ 
			return instance.getItemsForSale();
		})//geth 
		.then(data =>{ 
			// console.log(instance.items(1));
			assert.equal(data.length, 1, "There should be still be one item for sale");
			return instance.items(data[0]);
		})
		.then(data =>{//Check if the state didnt change
			assert.equal(data[0], 1, "Id of sold item must be 1");
			assert.equal(data[1], seller, "Seller address must be "+ seller);
			assert.equal(data[2], 0x0, "Buyer address must be empty at this point");
			assert.equal(data[3], itemName, "Item name must be " + itemName);
			assert.equal(data[4], description, "Item description must be "+ description);
			assert.equal(data[5], price, `Item price must be ${price}`);
		})
	});

	it("should throw an error when you try buying an item for a value different from the price", () =>{
		return ProductList.deployed().then(i =>{
			instance = i;
			return instance.buyItem(1, {from: seller, value:price + 1});//Try buying at a different price
		}).then(assert.fail)//fail at it
		.catch(error => assert(true))
		.then(() => {
			return instance.getItemsForSale();
		})
		.then(data =>{
			assert.equal(data.length, 1, "There should still be one item for sale");
			return instance.items(data[0]);//get the item with the id (id is in data[0])
		})//Get the current state of things in the contract
		.then(data =>{//Check if the state didnt change
			assert.equal(data[0], 1, "Id of sold item must be 1");
			assert.equal(data[1], seller, "Seller address must be "+ seller);
			assert.equal(data[2], 0x0, "Buyer address must be empty at this point");
			assert.equal(data[3], itemName, "Item name must be " + itemName);
			assert.equal(data[4], description, "Item description must be "+ description);
			assert.equal(data[5], price, `Item price must be ${price}`);
		})
	});

	it("should throw an error when you try buying an item thats already been sold", () =>{
		return ProductList.deployed().then(i =>{
			instance = i;
			// Buy an item first
			return instance.buyItem(1, {from: buyer, value:price});
		}).then(receipt =>{
			return instance.buyItem(1, {from: buyer, value:price});//Try buying again
		}).then(assert.fail)//fail at it
		.catch(error => assert(true))
		.then(() => {
			return instance.getItemsForSale();
		})
		.then(data =>{
			assert.equal(data.length, 0, "There should be no item for sale");
			return instance.items(1);//get the item with the id of 1
		})//Get the current state of things in the contract
		.then(data =>{//Check if the state didnt change
			assert.equal(data[0], 1, "Id of sold item must be 1");
			assert.equal(data[1], seller, "Seller address must be "+ seller);
			assert.equal(data[2], buyer, "Buyer address must be " + buyer);
			assert.equal(data[3], itemName, "Item name must be " + itemName);
			assert.equal(data[4], description, "Item description must be "+ description);
			assert.equal(data[5], price, `Item price must be ${price}`);
		})

	});

})