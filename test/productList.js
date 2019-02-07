var ProductList = artifacts.require("ProductList");

contract('ProductList', (accounts) =>{

	var listInstance, accs, seller, sellerBalBeforeBuy, sellerBalAfterBuy, buyerBalBeforeBuy, buyerBalAfterBuy;
	web3.eth.getAccounts().then(data => {
		accs = data;
		seller = accs[0];
		buyer = accs[1];
	});
	var itemName1 = "Item 1";
	var description1 = "Description for item 1";
	var price1 = web3.utils.toWei('10', 'ether');

	var itemName2 = "Item 2";
	var description2 = "Description for item 2";
	var price2 = web3.utils.toWei('20', 'ether');

	it("Should be initialized with empty values", ()=>{
		return ProductList.deployed().then(instance =>{
			listInstance = instance;
			return listInstance.getNumberOfItems();
		}).then(data =>{
			assert.equal(data.toNumber(), 0, "There shouldn't be any item at all");
			return listInstance.getItemsForSale();
		}).then(data =>{
			assert.equal(data.length, 0, "There shouldn't be any item for sale");
		});
	});

	it("Should sell a first item", () =>{
		return ProductList.deployed().then(instance =>{
			listInstance = instance;
			return listInstance.sellItem(itemName1, description1, price1, {from: seller});
		}).then((receipt) => {
			assert.equal(receipt.logs.length, 1, "An event should have been triggered");
			assert.equal(receipt.logs[0].event, "itemSold", "Event must be itemSold");
			assert.equal(receipt.logs[0].args._id, 1)
			assert.equal(receipt.logs[0].args._seller, seller, "Seller address must be "+ seller);
			assert.equal(receipt.logs[0].args._name, itemName1, "name must be "+ itemName1);
			assert.equal(receipt.logs[0].args._price, price1, "price must be "+ price1);
			//Check the number of items that had been put for sale in the record
			return listInstance.getNumberOfItems();
		}).then(data =>{
			assert.equal(data.toNumber(), 1)
			//Check the array of the first item currently for sale
			return listInstance.getItemsForSale();
		}).then(data =>{
			assert(data[0], 1, "The id of the item sold must be one");
			assert(data.length, 1, "The length of the items for sale must be 1");
			return listInstance.items(data[0]);
		}).then(data =>{
			assert.equal(data[0], 1, "Id of the sold item must be 1");
			assert.equal(data[1], seller, "Seller address must be "+ seller);
			assert.equal(data[2], 0x0, "Buyer address must be empty at the point of posting item for sale");
			assert.equal(data[3], itemName1, "Item name must be " + itemName1);
			assert.equal(data[4], description1, "Item description must be " + description1);
			assert.equal(data[5], price1, `Item price must be ${price1}`);

		});
	});

	//Sell a second item
	it("Should sell a second item", () =>{
		return ProductList.deployed().then(instance =>{
			listInstance = instance;
			return listInstance.sellItem(itemName2, description2, price2, {from: seller});
		}).then((receipt) => {
			assert.equal(receipt.logs.length, 1, "An event should have been triggered");
			assert.equal(receipt.logs[0].event, "itemSold", "Event must be itemSold");
			assert.equal(receipt.logs[0].args._id, 2)
			assert.equal(receipt.logs[0].args._seller, seller, "Seller address must be "+ seller);
			assert.equal(receipt.logs[0].args._name, itemName2, "name must be "+ itemName2);
			assert.equal(receipt.logs[0].args._price, price2, "price must be "+ price2);
			//Check the number of items that had been put for sale in the record
			return listInstance.getNumberOfItems();
		}).then(data =>{
			assert.equal(data.toNumber(), 2)
			//Check the array of the first item currently for sale
			return listInstance.getItemsForSale();
		}).then(data =>{
			assert(data[1], 2, "The id of the item sold must be two");
			assert(data.length, 2, "The length of the items for sale must be 2");
			return listInstance.items(data[1]);
		}).then(data =>{
			assert.equal(data[0], 2, "Id of the sold item must be 2");
			assert.equal(data[1], seller, "Seller address must be "+ seller);
			assert.equal(data[2], 0x0, "Buyer address must be empty at the point of posting item for sale");
			assert.equal(data[3], itemName2, "Item name must be " + itemName2);
			assert.equal(data[4], description2, "Item description must be " + description2);
			assert.equal(data[5], price2, `Item price must be ${price2}`);

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
			return listInstance.buyItem(1, {from: buyer, value: price1});
		}).then(data =>{
			assert.equal(data.logs.length, 1, "An event should have been triggered");
			assert.equal(data.logs[0].event, "itemBought", "Event must be itemBought");
			assert.equal(data.logs[0].args._id.toNumber(), 1, "Id of the item bought must be 1");
			assert.equal(data.logs[0].args._seller, seller, "Seller address must be "+ seller);
			assert.equal(data.logs[0].args._buyer, buyer, "Buyer address must be "+ buyer);
			assert.equal(data.logs[0].args._name, itemName1, "name must be "+ itemName1);
			assert.equal(data.logs[0].args._price, price1, "price must be "+ price1);
			//Record balance of seller and buyer after the buy
			web3.eth.getBalance(seller).then(bal => {
				amt = bal;
				sellerBalAfterBuy = parseInt(web3.utils.fromWei(amt, 'ether'));
				web3.eth.getBalance(buyer).then(bal => {
					amt = bal;
					buyerBalAfterBuy = parseInt(web3.utils.fromWei(amt, 'ether'));
					//Confirming the effect of purchase on buyer and seller
					assert(sellerBalAfterBuy == sellerBalBeforeBuy + parseInt(web3.utils.fromWei(price1, 'ether')), 'Seller should have earned '+ web3.utils.fromWei(price1, 'ether') + ' ETH');
					assert(buyerBalAfterBuy <= buyerBalBeforeBuy - parseInt(web3.utils.fromWei(price1, 'ether')), 'Buyer should have spent at least'+ price1 + ' ETH');
					return listInstance.getItemsForSale();
				}).then(data =>{//Check if the contract's state has been updated in the right way
					assert.equal(data.length, 1, "there should be one item left for sale");
					assert.equal(data[0].toNumber(), 2, "there should be only item with id 2 left for sale");
					return listInstance.getNumberOfItems();//Check the number of items is still the same
				}).then(data =>{
					assert.equal(data.toNumber(), 2,  "There should still be two articles in total");
				})
				
			});//End of getting seller's balance
			
		});//End of buyItem trigger
			
	});//End of test begin

});