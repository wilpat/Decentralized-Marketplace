App = {
     web3Provider: null,
     contracts: {},
     loading: false,
     mounted: false,

     init: () => {
          return App.initWeb3();
     },

     initWeb3: () => {
      // Initialize web3
        if(typeof web3 !== 'undefined'){
          //Use the provider of the Web3 object injected by metamask
          App.web3Provider = web3.currentProvider
        }else{
          //Create a new provider and plug it into our local node
          App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(App.web3Provider);

        App.displayAccountInfo();
        return App.initContract();
     },

     displayAccountInfo: () =>{
        web3.eth.getCoinbase((err,account) => { 
          // console.log(account);
          if(err === null){
             App.account = account;
             $('#account').text(account);
             web3.eth.getBalance(account,(err, balance) =>{
              if(err === null){
                $('#accountBalance').text(web3.fromWei(`${balance}`, 'ether') + " ETH");
              }
             })
          }
        })

     },

     initContract: () =>{
        $.getJSON('ProductList.json', (productListArtifact)=>{
          //This json file is accessible thanks to truffle's browser sync with the bs-config.json that exposes the
          //files in src and build/contracts folder
          //Get the contract artifact file and use it to instantiate a truffle contract abstraction
          App.contracts.ProductList = TruffleContract(productListArtifact);
          // set the provider for our contracts
          App.contracts.ProductList.setProvider(App.web3Provider);
          //Retrieve the item from the contract
          App.listenForEvents();

          return App.reloadItems()
        }).then(res =>{
          App.mounted = true;
        })
     },


     reloadItems: ()=>{
      //Prevent re-entry
      if(App.loading){
        return;
      }
      App.loading = true;
      var instance;
      //Refetch the account info cos bal might have changed
      App.displayAccountInfo();
      // retrieve the items placeholder and clear it
      $('#itemsRow').empty();
      App.contracts.ProductList.deployed().then(i =>{
        instance = i;
        return instance.getItemsForSale();//Returns an array of the ids of items for sale
      }).then(itemIds =>{
        // console.log(itemIds)
        for (var i = itemIds.length - 1; i >= 0; i--) {//Iterate and render the items in descending order
          var itemId = itemIds[i];
          instance.items(itemId.toNumber()).then(item => {
            App.displayItems(item[0], item[1], item[3], item[4], item[5]);
          })
        }
        App.loading = false;
        
      }).catch(error =>{
        console.error(error);
        App.loading = false;
      })
     },

     displayItems: (id, seller, name, description, price) =>{
        //Retrieve the item template and fill it
        var itemTemplate = $('#itemTemplate');
        itemTemplate.find('.panel-title').text(name);
        itemTemplate.find('.item-description').text(description);
        itemTemplate.find('.item-price').text(web3.fromWei(price, 'ether') + " ETH");
        itemTemplate.find('.btn-buy').attr('data-id', id);
        itemTemplate.find('.btn-buy').attr('data-value', web3.fromWei(price, 'ether'));

        if(seller == App.account){//If item seller is the same as current user
          seller = 'You';
          itemTemplate.find('.btn-buy').hide();
        }else{
          itemTemplate.find('.btn-buy').show();
        }
        itemTemplate.find('.item-seller').text(seller);
        //add this item to the row
        $('#itemsRow').append(itemTemplate.html());
     },

     sellItem: () =>{
      // Retreive the details of the item you wanna sell
      var _name = $('#item_name').val();
      var _description = $('#item_description').val();
      var _price = web3.toWei(parseInt($('#item_price').val()), 'ether');
      if((_name.trim() == '') || (_price == 0)){
        //Incomplete sales details
      return false;
       }
      App.contracts.ProductList.deployed().then(instance => {
        return instance.sellItem(_name, _description, _price, {
          from: App.account,
          gas: 500000
          });
      }).then(result =>{
        App.reloadItems();
      }).catch(err =>{
        console.error(err);
      });
    },


    listenForEvents: () => {

    App.contracts.ProductList.deployed().then(instance => {
      //Restart chrome if you're unable to receive this event.
      //This is a known issue with MetaMask
      //github.com/MetaMask/metamask-extension/issues/2393
      instance.itemSold({}, {}).watch((error, event) =>{
        if(!error){
          $('#events').append(`<li class ='list-group'>${event.args._name} is now for sale`);
          if(!App.mounted){
            App.reloadItems();//Rerender the app only after the first loading is complete 
          }
        }else{
          console.error(error)
        }
        
      });

      instance.itemBought({}, {}).watch((error, event) =>{
        if(!error){
          $('#events').append(`<li class ='list-group'>${event.args._buyer} bought ${event.args._name}`)
          App.reloadItems();//Rerender the app
        }else{
          console.error(error)
        }
        
      });

    });

  },
  buyItem: () =>{
    event.preventDefault();
    var _id = $(event.target).data('id');//The value of the btn clicked as we set it above
    var _price = $(event.target).data('value');//The value of the btn clicked as we set it above
    App.contracts.ProductList.deployed().then(instance => {
      instance.buyItem(_id, {
        from:App.account,
        value: web3.toWei(_price, 'ether'),
        gas: 500000
      })
    }).catch(error=>{
      console.error(error)
    });
  }
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
