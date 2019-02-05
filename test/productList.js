var ProductList = artifacts.require("ProductList");

contract('ProductList', (accounts) =>{

	var listInstance, accs, seller, sellerBalBeforeBuy, sellerBalAfterBuy, buyerBalBeforeBuy, buyerBalAfterBuy;
	web3.eth.getAccounts().then(data => {
		accs = data;
		seller = accs[0];
		buyer = accs[1];
	});
	var itemName = "Item 1";
	var description = "Description for item 1";
	var price = web3.utils.toWei('10', 'ether');

	it("Should be initialized with empty values", ()=>{
		return ProductList.deployed().then(instance =>{
			return instance.getItem();
		}).then(data =>{
			assert.equal(data[0], 0x0, "Seller address must be empty");
			assert.equal(data[1], 0x0, "Buyer address must be empty");
			assert.equal(data[2], '', "Item name must be empty");
			assert.equal(data[3], '', "Item description must be empty");
			assert.equal(data[4].toNumber(), 0, `Item price ${data[4].toNumber()} must be zero`);

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
			assert.equal(data[1], 0x0, "Buyer address must be empty at the point of posting item for sale");
			assert.equal(data[2], itemName, "Item name must be " + itemName);
			assert.equal(data[3], description, "Item description must be " + description);
			assert.equal(data[4], price, `Item price must be ${price}`);

		});
	});

	it("Should buy an item", () =>{
		return ProductList.deployed().then(i => {
			listInstance = i;

			//Record balance of seller and buyer before the buy
			web3.eth.getBalance(seller).then(bal => {
				amt = bal;
				sellerBalBeforeBuy = parseInt(web3.utils.fromWei(amt, 'ether'));
			});
			web3.eth.getBalance(buyer).then(bal => {
				amt = bal;
				buyerBalBeforeBuy = parseInt(web3.utils.fromWei(amt, 'ether'));
			})
			return listInstance.buyItem({from: buyer, value: price});
		}).then(data =>{
			assert.equal(data.logs.length, 1, "An event should have been triggered");
			assert.equal(data.logs[0].event, "itemBought", "Event must be itemBought");
			assert.equal(data.logs[0].args._seller, seller, "Seller address must be "+ seller);
			assert.equal(data.logs[0].args._buyer, buyer, "Buyer address must be "+ buyer);
			assert.equal(data.logs[0].args._name, itemName, "name must be "+ itemName);
			assert.equal(data.logs[0].args._price	, price, "price must be "+ price);
			//Record balance of seller and buyer after the buy
			web3.eth.getBalance(seller).then(bal => {
				amt = bal;
				sellerBalAfterBuy = parseInt(web3.utils.fromWei(amt, 'ether'));
				web3.eth.getBalance(buyer).then(bal => {
					amt = bal;
					buyerBalAfterBuy = parseInt(web3.utils.fromWei(amt, 'ether'));
					//Confirming the effect of purchase on buyer and seller
					assert(sellerBalAfterBuy == sellerBalBeforeBuy + parseInt(web3.utils.fromWei(price, 'ether')), 'Seller should have earned '+ web3.utils.fromWei(price, 'ether') + ' ETH');
					assert(buyerBalAfterBuy <= buyerBalBeforeBuy - parseInt(web3.utils.fromWei(price, 'ether')), 'Buyer should have spent at least'+ price + ' ETH');
					return listInstance.getItem();
				}).then(data =>{//Check if the contract's state has been updated in the right way
					assert.equal(data[0], seller, "Seller address must be "+ seller);
					assert.equal(data[1], buyer, "Buyer address must be "+ buyer);
					assert.equal(data[2], itemName, "Item name must be empty");
					assert.equal(data[3], description, "Item description must be empty");
					assert.equal(data[4], price, `Item price must be ${price}`);
				});//End of getting buyer's balance
				
			});//End of getting seller's balance
			
		});//End of buyItem trigger
			
	});//End of test begin

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