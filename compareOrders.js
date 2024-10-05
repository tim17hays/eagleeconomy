function findBestExchange(orders) {
    const buys = orders.filter(order => order.order_type === 'buy');
    const sells = orders.filter(order => order.order_type === 'sell');
  
    let bestMatch = null;
    let bestDifference = Infinity; // Start with an infinitely large difference
  
    // Iterate through all possible buy and sell matches to find the closest rates and amounts
    for (const buy of buys) {
      for (const sell of sells) {
        // Ensure locations match
        if (buy.location === sell.location) {
          // Calculate percentage differences for exchange rates and amounts
          const rateDifference = Math.abs(buy.exchange_rate - sell.exchange_rate) / ((buy.exchange_rate + sell.exchange_rate) / 2);
          const amountDifference = Math.abs(buy.amount_ebucks - sell.amount_ebucks) / ((buy.amount_ebucks + sell.amount_ebucks) / 2);
  
          // If both differences are within 50%, consider this a match
          if (rateDifference <= 0.5 && amountDifference <= 0.5) {
            // Calculate the combined difference to find the best match
            const totalDifference = rateDifference + amountDifference;
            if (totalDifference < bestDifference) {
              bestDifference = totalDifference;
              bestMatch = {
                buy_order: buy,
                sell_order: sell
              };
            }
          }
        }
      }
    }
  
    return bestMatch;
  }
  
  module.exports = findBestExchange;
  