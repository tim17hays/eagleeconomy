// Bidder Class
class Bidder {
    constructor(exchangeBid, totalCost, seller, location, time) {
      this.exchangeBid = exchangeBid;
      this.totalCost = totalCost;
      this.seller = seller;  // Corrected from the Python typo
      this.location = location;
      this.time = time;
    }
  }
  
  // Helper Functions
  
  // Check if the potentialBidder is a valid seller
  function isValidSeller(ourBidder, potentialBidder) {
    return potentialBidder.seller && ourBidder.totalCost < potentialBidder.totalCost;
  }
  
  // Check if the potentialBidder is a valid buyer
  function isValidBuyer(ourBidder, potentialBidder) {
    return !potentialBidder.seller && ourBidder.totalCost > potentialBidder.totalCost;
  }
  
  // Get the lowest possible seller for the buyer
  function getLowestPossibleSeller(buyer, bidders) {
    let lowest = null; 
    for (let i = 0; i < bidders.length; i++) {
      if (isValidSeller(buyer, bidders[i]) && (!lowest || bidders[i].exchangeBid < lowest.exchangeBid)) {
        lowest = bidders[i];
      }
    }
    return lowest;
  }
  
  // Get the highest possible buyer
  function getHighestPossibleBuyer(seller, bidders) {
    let highest = null;
    for (let i = 0; i < bidders.length; i++) {
      if (isValidBuyer(seller, bidders[i]) && (!highest || bidders[i].totalCost > highest.totalCost)) {
        highest = bidders[i];
      }
    }
    return highest;
  }
  
  // Get the highest bidder
  function getHighestBidder(bidders) {
    let highestBuyer = null;
    for (let i = 0; i < bidders.length; i++) {
      if (!bidders[i].seller && (!highestBuyer || bidders[i].exchangeBid > highestBuyer.exchangeBid)) {
        highestBuyer = bidders[i];
      }
    }
    return highestBuyer;
  }
  
  // Get the lowest bidder
  function getLowestBidder(bidders) {
    let lowestSeller = null;
    for (let i = 0; i < bidders.length; i++) {
      if (bidders[i].seller && (!lowestSeller || bidders[i].exchangeBid < lowestSeller.exchangeBid)) {
        lowestSeller = bidders[i];
      }
    }
    return lowestSeller;
  }
  
  // Get exchange bid for a specific bidder
  function getExchange(bidder) {
    return bidder.exchangeBid;
  }
  
  // Get total cost for a specific bidder
  function getTotalCost(bidder) {
    return bidder.totalCost;
  }
  
  // Bid function for purchasing
  function bid(purchase, totalCost, exchangeBid, bidders) {
    if (purchase) {
      let highestSeller = getLowestBidder(bidders);
      // Further logic to handle purchase can be added here
    }
  }
  
  // Placeholder for getMarketPrice and getHistoricalPrice
  function getMarketPrice() {
    // Logic to calculate market price goes here
  }
  
  function getHistoricalPrice() {
    // Logic to retrieve historical price goes here
  }
  