import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../../assets/assets';

const Orders = () => {
  const [data, setData] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/orders/all');
      setData(response.data || []);
    } catch (error) {
      toast.error('Unable to load orders right now.');
      console.error('Failed to fetch orders', error);
    }
  };

  const updateStatus =  async (event, orderId) => {
    try {
      const response = await axios.patch(`http://localhost:8080/api/orders/status/${orderId}?status=${event.target.value}`);
      if (response.status === 200) {
        await fetchOrders();
        toast.success('Order status updated.');
      }
    } catch (error) {
      toast.error('Unable to update order status.');
      console.error('Failed to update order status', error);
    }
  };



  useEffect(() => {
    fetchOrders();
  }, []);


  return (
    <div className="container">
        <div className="py-5 row justify-content-center">
            <div className="col-11 card">
                <table className="table table-responsive">
                    <tbody>
                        {
                            data.map((order, index) => {
                                const amount = Number(order?.amount);
                                const items = order?.orderedItems || [];
                                return (
                                    <tr key={index}>
                                        <td>
                                            <img src={assets.parcel} alt="" height={48} width={48} />
                                        </td>
                                        <td>
                                          <div>
                                          {items.length > 0
                                            ? items.map((item, index) => {
                                                if (index === items.length -1) {
                                                    return `${item.name} x ${item.quantity}`;
                                                }
                                                return `${item.name} x ${item.quantity}, `;
                                              })
                                            : 'No items'}
                                          </div>
                                          <div>
                                            {order.userAddress}
                                          </div>
                                        </td>
                                        <td>${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}</td>
                                        <td>Items: {items.length}</td>
                                        <td>
                                           <select className="form-control" onChange={(event) => updateStatus(event, order.id)} value={order.orderStatus}>
                                            <option value="Food Preparing">Food Preparing</option>
                                            <option value="Out for delivery">Out for delivery</option>
                                            <option value="Delivered">Delivered</option>
                                           </select>
                                        </td>

                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Orders;
