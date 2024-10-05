document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inputform');
  const orderList = document.getElementById('orderList');

  form.addEventListener('submit', (event) => {
    // Prevent default form submission behavior (page reload)
    event.preventDefault();

    // Get the selected order type (Buy or Sell)
    const orderTypeInputs = document.getElementsByName('order_type');
    let orderType = '';
    for (const input of orderTypeInputs) {
      if (input.checked) {
        orderType = input.value;
        break;
      }
    }

    // Get the selected location (Lower, Upper, On Campus)
    const locationInputs = document.getElementsByName('location');
    let location = '';
    for (const input of locationInputs) {
      if (input.checked) {
        location = input.value;
        break;
      }
    }

    // Get USD and Eagle Bucks values
    const usdInput = document.getElementById('usd');
    const ebucksInput = document.getElementById('ebucks');

    if (!usdInput || !ebucksInput) {
      console.error('Missing input elements.');
      return;
    }

    const usdValue = parseFloat(usdInput.value);
    const ebucksValue = parseFloat(ebucksInput.value);

    // Validate and send the order to the server
    if (orderType && location && !isNaN(usdValue) && !isNaN(ebucksValue) && ebucksValue > 0) {
      // Prepare data to send to the server
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
          console.log('Success:', data);
          
          // Calculate price per Eagle Buck for displaying in the order list
          const pricePerEBuck = (usdValue / ebucksValue).toFixed(2);
          
          // Create a new order item element
          const orderItem = document.createElement('p');
          orderItem.textContent = `${orderType.toUpperCase()} at ${location}: $${usdValue} for ${ebucksValue} Eagle Bucks, $${pricePerEBuck} per Eagle Buck`;

          // Append the new order item to the order list
          orderList.appendChild(orderItem);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } else {
      console.error('Invalid input: Choose an order type, location, and provide valid USD/Eagle Buck values.');
    }
  });
});
