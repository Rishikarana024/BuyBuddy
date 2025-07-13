export function createOrder(order) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
        headers: { 'content-type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to create order:', errorText);
        reject(new Error('Failed to create order'));
        return;
      }

      const data = await response.json();

      if (!data?.id) {
        console.error('❌ Order creation succeeded but missing ID:', data);
        reject(new Error('Order created but no ID returned'));
        return;
      }

      console.log('✅ Order successfully created:', data);
      resolve({ data });
    } catch (error) {
      console.error('❌ Error creating order:', error);
      reject(error);
    }
  });
}

export function updateOrder(order) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch('/orders/' + order.id, {
        method: 'PATCH',
        body: JSON.stringify(order),
        headers: { 'content-type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to update order:', errorText);
        reject(new Error('Failed to update order'));
        return;
      }

      const data = await response.json();
      resolve({ data });
    } catch (error) {
      console.error('❌ Error updating order:', error);
      reject(error);
    }
  });
}

export function fetchAllOrders(sort, pagination) {
  let queryString = '';

  for (let key in sort) {
    queryString += `${key}=${sort[key]}&`;
  }
  for (let key in pagination) {
    queryString += `${key}=${pagination[key]}&`;
  }

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch('/orders?' + queryString);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch orders:', errorText);
        reject(new Error('Failed to fetch orders'));
        return;
      }

      const data = await response.json();
      const totalOrders = await response.headers.get('X-Total-Count');

      resolve({ data: { orders: data, totalOrders: +totalOrders } });
    } catch (error) {
      console.error('❌ Error fetching all orders:', error);
      reject(error);
    }
  });
}
