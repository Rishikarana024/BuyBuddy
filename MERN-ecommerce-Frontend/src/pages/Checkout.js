import { Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { deleteItemFromCartAsync, selectItems, updateCartAsync } from '../features/cart/cartSlice';
import { useForm } from 'react-hook-form';
import { updateUserAsync, selectUserInfo } from '../features/user/userSlice';
import { useState } from 'react';
import { createOrderAsync, selectCurrentOrder, selectStatus } from '../features/order/orderSlice';
import { Grid } from 'react-loader-spinner';

function Checkout() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const user = useSelector(selectUserInfo);
  const items = useSelector(selectItems);
  const status = useSelector(selectStatus);
  const currentOrder = useSelector(selectCurrentOrder);

  const totalAmount = items.reduce(
    (amount, item) => (item?.product?.discountPrice || 0) * item.quantity + amount,
    0
  );
  const totalItems = items.reduce((total, item) => item.quantity + total, 0);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const handleQuantity = (e, item) => {
    dispatch(updateCartAsync({ id: item.id, quantity: +e.target.value }));
  };

  const handleRemove = (e, id) => {
    dispatch(deleteItemFromCartAsync(id));
  };

  const handleAddress = (e) => {
    setSelectedAddress(user.addresses[e.target.value]);
  };

  const handlePayment = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleOrder = () => {
    if (selectedAddress && paymentMethod) {
      const order = {
        items,
        totalAmount,
        totalItems,
        user: user.id,
        paymentMethod,
        selectedAddress,
        status: 'pending',
      };
      dispatch(createOrderAsync(order));
    } else {
      alert('Please select an address and payment method.');
    }
  };

  if (!items.length) return <Navigate to="/" replace />;
  if (currentOrder && currentOrder.paymentMethod === 'cash') return <Navigate to={`/order-success/${currentOrder.id}`} replace />;
  if (currentOrder && currentOrder.paymentMethod === 'card') return <Navigate to={`/stripe-checkout/`} replace />;

  return (
    <>
      {status === 'loading' ? (
        <div className="flex justify-center mt-10">
          <Grid height="80" width="80" color="#4f46e5" visible={true} />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {/* Address Form */}
              <form
                className="bg-white px-5 py-12 mt-12"
                noValidate
                onSubmit={handleSubmit((data) => {
                  dispatch(updateUserAsync({ ...user, addresses: [...user.addresses, data] }));
                  reset();
                })}
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Add New Address</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  <input {...register('name', { required: 'Name is required' })} placeholder="Full Name" className="input" />
                  <input {...register('email', { required: 'Email is required' })} placeholder="Email" type="email" className="input" />
                  <input {...register('phone', { required: 'Phone is required' })} placeholder="Phone" className="input" />
                  <input {...register('street', { required: 'Street is required' })} placeholder="Street Address" className="input" />
                  <input {...register('city', { required: 'City is required' })} placeholder="City" className="input" />
                  <input {...register('state', { required: 'State is required' })} placeholder="State" className="input" />
                  <input {...register('pinCode', { required: 'PIN Code is required' })} placeholder="PIN Code" className="input" />
                </div>
                <button type="submit" className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded">Add Address</button>
              </form>

              {/* Existing Addresses */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Select Address</h2>
                <ul>
                  {user.addresses.map((address, index) => (
                    <li key={index} className="border p-4 mb-2 rounded flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        value={index}
                        onChange={handleAddress}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold">{address.name}</p>
                        <p>{address.street}, {address.city}, {address.state} - {address.pinCode}</p>
                        <p>Phone: {address.phone}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Methods */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Select Payment Method</h2>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="payment" value="cash" onChange={handlePayment} />
                    Cash
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="payment" value="card" onChange={handlePayment} />
                    Card
                  </label>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 mt-12 rounded shadow">
                <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product?.thumbnail || '/placeholder.jpg'}
                        alt={item.product?.title || 'Product'}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">{item.product?.title}</h4>
                        <p className="text-sm text-gray-500">{item.product?.brand}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <select value={item.quantity} onChange={(e) => handleQuantity(e, item)} className="border px-2 py-1">
                        {[1, 2, 3, 4, 5].map((qty) => (
                          <option key={qty} value={qty}>{qty}</option>
                        ))}
                      </select>
                      <p className="font-semibold">${item.product?.discountPrice}</p>
                      <button onClick={() => handleRemove(null, item.id)} className="text-red-500 text-sm">Remove</button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <p className="flex justify-between">
                    <span>Subtotal:</span> <span>${totalAmount}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Total Items:</span> <span>{totalItems}</span>
                  </p>
                </div>

                <button
                  onClick={handleOrder}
                  className="mt-6 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Order Now
                </button>

                <div className="text-center mt-4">
                  <Link to="/" className="text-indigo-600 text-sm hover:underline">← Continue Shopping</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Checkout;
