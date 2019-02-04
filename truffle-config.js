module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    william: {
      host: "127.0.0.1",
      port: 8080,
      network_id: "4224",
      gas: 4700000
    }
  }
};
