document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inputform');
  const orderList = document.getElementById('orderList');
  const bestMatchDiv = document.getElementById('bestMatch');

  // Fetch the 10 most recent orders on page load
  fetch('/recent-orders')
    .then(response => response.json())
    .then(orders => {
      orderList.innerHTML = ''; // Clear the existing list
      orders.forEach(order => {
        const orderItem = document.createElement('p');
        orderItem.textContent = `${order.order_type.toUpperCase()} at ${order.location.toUpperCase()}: $${order.exchange_rate.toFixed(2)} each for ${order.amount_ebucks} Eagle Bucks`;
        orderList.appendChild(orderItem);
      });
    })
    .catch(error => {
      console.error('Error fetching recent orders:', error);
    });

  // Handle form submission
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
              const { new_order, counterpart_order } = data.bestMatch;

              // Check if new_order and counterpart_order are defined
              if (new_order && counterpart_order) {
                bestMatchDiv.innerHTML = `
                  <p>NEW ${new_order.order_type.toUpperCase()} ORDER at ${new_order.location.toUpperCase()} - $${new_order.exchange_rate.toFixed(2)} for ${new_order.amount_ebucks} Eagle Bucks</p>
                  <p>Matched With:</p>
                  <p>${counterpart_order.order_type.toUpperCase()} ORDER at ${counterpart_order.location.toUpperCase()} - $${counterpart_order.exchange_rate.toFixed(2)} for ${counterpart_order.amount_ebucks} Eagle Bucks</p>
                `;
              } else {
                bestMatchDiv.innerHTML = '<p>No suitable match found for the new order.</p>';
              }
            } else {
              bestMatchDiv.innerHTML = '<p>No suitable match found.</p>';
            }

            // Add the newly submitted order to the "All Orders" list
            const orderItem = document.createElement('p');
            orderItem.textContent = `order.order_type.toUpperCase()} at ${order.location.toUpperCase()}: $${order.exchange_rate.toFixed(2)} each for ${order.amount_ebucks} Eagle Bucks`;
            orderList.insertBefore(orderItem, orderList.firstChild); // Add the new order to the top of the list
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
