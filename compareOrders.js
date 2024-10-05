// Bidder Class
class Bidder {
    constructor(exchangeBid, totalCost, seller, location, time) {
      this.exchangeBid = exchangeBid; // Price per Eagle Buck
      this.totalCost = totalCost; // Total cost in USD
      this.seller = seller; // Boolean indicating if this bidder is a seller
      this.location = location; // Location of the bid
      this.time = time; // Timestamp of the bid
    }
  }
  
  // Helper Functions
  
  // Check if the potentialBidder is a valid seller for the current buyer
  function isValidSeller(ourBidder, potentialBidder) {
    return potentialBidder.seller && 
           ourBidder.totalCost >= potentialBidder.totalCost && 
           ourBidder.location === potentialBidder.location; // Ensure matching location
  }
  
  // Check if the potentialBidder is a valid buyer for the current seller
  function isValidBuyer(ourBidder, potentialBidder) {
    return !potentialBidder.seller && 
           ourBidder.totalCost <= potentialBidder.totalCost &&
           ourBidder.location === potentialBidder.location; // Ensure matching location
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
  
  // Get the highest possible buyer for the seller
  function getHighestPossibleBuyer(seller, bidders) {
    let highest = null;
    for (let i = 0; i < bidders.length; i++) {
      if (isValidBuyer(seller, bidders[i]) && (!highest || bidders[i].totalCost > highest.totalCost)) {
        highest = bidders[i];
      }
    }
    return highest;
  }
  
  // Main function to find the best match for a new order
  function findBestExchange(newOrder, existingOrders) {
    // Convert existing orders into Bidder instances
    const bidders = existingOrders.map(order => {
      return new Bidder(
        order.exchange_rate, 
        order.amount_ebucks * order.exchange_rate, // Total cost in USD
        order.order_type === 'sell', // Boolean: true if seller
        order.location,
        order.timestamp
      );
    });
  
    // Create a Bidder instance for the new order
    const newBidder = new Bidder(
      newOrder.exchange_rate,
      newOrder.amount_ebucks * newOrder.exchange_rate, // Total cost in USD
      newOrder.order_type === 'sell',
      newOrder.location,
      newOrder.timestamp
    );
  
    let bestMatch = null;
  
    if (newBidder.seller) {
      // If the new order is a seller, find the highest possible buyer
      const highestBuyer = getHighestPossibleBuyer(newBidder, bidders);
      if (highestBuyer) {
        bestMatch = {
          new_order: newBidder,
          counterpart_order: highestBuyer
        };
      }
    } else {
      // If the new order is a buyer, find the lowest possible seller
      const lowestSeller = getLowestPossibleSeller(newBidder, bidders);
      if (lowestSeller) {
        bestMatch = {
          new_order: newBidder,
          counterpart_order: lowestSeller
        };
      }
    }
  
    return bestMatch;
  }
  
  module.exports = findBestExchange;
  