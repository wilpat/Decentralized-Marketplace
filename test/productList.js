var ProductList = artifacts.require("ProductList");

contract('ProductList', (accounts) =>{

	var listInstance, accs, seller;
	web3.eth.getAccounts().then(data => {
		accs = data;
		seller = accs[0];
	});
	var itemName = "Item 1";
	var description = "Description for item 1";
	var price = web3.utils.toWei('10', 'ether');

	it("Should be initialized with empty values", ()=>{
		return ProductList.deployed().then(instance =>{
			return instance.getItem();
		}).then(data =>{
			assert.equal(data[0], 0x0, "Seller address must be empty");
			assert.equal(data[1], '', "Item name must be empty");
			assert.equal(data[2], '', "Item description must be empty");
			assert.equal(data[3].toNumber(), 0, `Item price ${data[3].toNumber()} must be zero`);

		});
	});

	it("Should sell an item", () =>{
		return ProductList.deployed().then(instance =>{
			listInstance = instance;
			return listInstance.sellItem(itemName, description, price, {from: seller});
		}).then(() => {
			return listInstance.getItem();
		}).then(data =>{
			assert.equal(data[0], seller, "Seller address must be "+ seller);
			assert.equal(data[1], itemName, "Item name must be empty");
			assert.equal(data[2], description, "Item description must be empty");
			assert.equal(data[3], price, `Item price must be ${price}`);

		});
	});
	it("Should trigger an event when an item is sold", () =>{
		return ProductList.deployed().then(instance =>{
			listInstance = instance;
			return listInstance.sellItem(itemName, description, price, {from: seller});
		}).then(data =>{
			assert.equal(data.logs.length, 1, "An event should have been triggered");
			assert.equal(data.logs[0].event, "itemSold", "Event must be itemSold");
			assert.equal(data.logs[0].args._seller, seller, "Seller address must be "+ seller);
			assert.equal(data.logs[0].args._name, itemName, "name must be "+ itemName);
			assert.equal(data.logs[0].args._price	, price, "price must be "+ price);

		});
	})
});