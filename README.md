# Decentralized-Marketplace
An application for buying and selling stuff on the ethereum blockchain network.

## Installation
Clone this repo then run `npm install` to get all the dependencies in place

Download, install and launch ['Ganache'](https://truffleframework.com/ganache) -  a personal blockchain 
for Ethereum development you can use to deploy contracts, develop applications, and run tests.

Download and install ['Metamask'](https://metamask.io/) - An extension that allows you access the ethereum network
from your browser

Sign into Metamask using either the Mnemonics on the dashboard or the private key of a particular ethereum address

run `npm run dev` to get started

## Technical details
I used the truffle pet-shop box to give me an out-of-the-box boilerplate to build on (You can pull that into your own
projects by installing truffle with `npm install truffle` then running `truffle unbox pet-shop`).

The smart contract housing the logic of this app is in the contracts/ProductList.sol

I used javascript to connect the smart contract to the front end of this app

