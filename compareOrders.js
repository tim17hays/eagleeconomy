function findBestExchange(newOrder, counterpartOrders) {
    let bestMatch = null;
    let bestDifference = Infinity; // Start with an infinitely large difference
  
    for (const counterpartOrder of counterpartOrders) {
      // Ensure locations match
      if (newOrder.location === counterpartOrder.location) {
        // Calculate percentage differences for exchange rates and amounts
        const rateDifference = Math.abs(newOrder.exchange_rate - counterpartOrder.exchange_rate) / ((newOrder.exchange_rate + counterpartOrder.exchange_rate) / 2);
        const amountDifference = Math.abs(newOrder.amount_ebucks - counterpartOrder.amount_ebucks) / ((newOrder.amount_ebucks + counterpartOrder.amount_ebucks) / 2);
  
        // If both differences are within 50%, consider this a match
        if (rateDifference <= 0.5 && amountDifference <= 0.5) {
          // Calculate the combined difference to find the best match
          const totalDifference = rateDifference + amountDifference;
          if (totalDifference < bestDifference) {
            bestDifference = totalDifference;
            bestMatch = {
              new_order: newOrder,
              counterpart_order: counterpartOrder
            };
          }
        }
      }
    }
  
    return bestMatch;
  }
  
  module.exports = findBestExchange;
  