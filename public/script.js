document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inputform');
  const orderList = document.getElementById('orderList');
  const bestMatchDiv = document.getElementById('bestMatch');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get the selected order type, location, USD, and eBucks values
    const orderTypeInputs = document.getElementsByName('order_type');
    let orderType = '';
    for (const input of orderTypeInputs) {
      if (input.checked) {
        orderType = input.value;
        break;
      }
    }

    const locationInputs = document.getElementsByName('location');
    let location = '';
    for (const input of locationInputs) {
      if (input.checked) {
        location = input.value;
        break;
      }
    }

    const usdValue = parseFloat(document.getElementById('usd').value);
    const ebucksValue = parseFloat(document.getElementById('ebucks').value);

    if (orderType && location && !isNaN(usdValue) && !isNaN(ebucksValue) && ebucksValue > 0) {
      const orderData = {
        orderType: orderType,
        usd: usdValue,
        ebucks: ebucksValue,
        location: location
      };

      // Send data to the server using fetch
      fetch('/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Display the best match found by the comparison logic
            if (data.bestMatch) {
              const { buy_order, sell_order } = data.bestMatch;
              bestMatchDiv.innerHTML = `
               <p>Best Exchange: BUY at ${buy_order.location}</p>
               <p>Exchange Rate: $${buy_order.exchange_rate.toFixed(2)} each for ${buy_order.amount_ebucks} Eagle Bucks</p>
               <p>Matched With:</p>
               <p>SELL at ${sell_order.location}</p>
               <p>Exchange Rate: $${sell_order.exchange_rate.toFixed(2)} each for ${sell_order.amount_ebucks} Eagle Bucks</p>
              `;
            } else {
              bestMatchDiv.innerHTML = '<p>No suitable match found.</p>';
            }

            // Add the newly submitted order to the "All Orders" list
            const orderItem = document.createElement('p');
            orderItem.textContent = `${orderType.toUpperCase()} at ${location}: $${usdValue} for ${ebucksValue} Eagle Bucks, $${(usdValue / ebucksValue).toFixed(2)} per Eagle Buck`;
            orderList.appendChild(orderItem);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } else {
      console.error('Invalid input: Choose an order type, location, and provide valid USD/Eagle Buck values.');
    }
  });
});
