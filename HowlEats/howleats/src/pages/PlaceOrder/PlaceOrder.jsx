import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { calculateCartTotals } from "../../util/cartUtils";
import { toast } from "react-toastify";
import axios from "axios";
import {RAZORPAY_KEY} from '../../util/constants';
import { useNavigate } from "react-router-dom";
// import Razorpay from "razorpay";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" }
];

const NORTH_CAROLINA_CITIES = [
  "Charlotte",
  "Raleigh",
  "Greensboro",
  "Durham",
  "Winston-Salem",
  "Fayetteville",
  "Cary",
  "Wilmington",
  "High Point",
  "Asheville"
];


const PlaceOrder = () => {
    const { foodList, quantities, token, setQuantities } = useContext(StoreContext);
    const navigate = useNavigate();

    const [data, setData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      zip: ''
    });

    const onChangeHandler = (event) => {
      const name = event.target.name;
      const value = event.target.value;
      setData(data => ({...data, [name]: value}))
    };

    const initiateRazorpayment = (order) => {
      if (!window.Razorpay) {
        toast.error('Payment gateway is unavailable right now. Please try again later.');
        return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(order.amount * 100),
        currency: order.currency || "USD",
        name: "Food Land",
        description: "Food Order Payment",
        order_id: order.razorpayOrderId,
        handler: async function(razorpayResponse) {
          await verifyPayment(razorpayResponse);
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phoneNumber
        },
        theme: {color: "#3399cc"},
        modal: {
          ondismiss: async function() {
            toast.error("Payment Cancelled.");
            await deleteOrder(order.id);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    };

    const verifyPayment = async (razorpayResponse) => {
      const paymentData = {
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      };
      try {
        const response = await axios.post("http://localhost:8080/api/orders/verify", paymentData, {headers: {'Authorization': `Bearer ${token}`}});
        if(response.status === 200) {
          toast.success('Payment Successful');
          await clearCart();
          navigate('/myorders');
        } else {
          toast.error('Payment Failed. Please try again');
          navigate('/');
        }
      } catch {
        toast.error('Payment Failed. Please try again');
      }
    };

    const onSubmitHandler = async (event) => {
      event.preventDefault();
      console.log("data", data);
      const orderData = {
        userAddress: `${data.firstName} ${data.lastName} ${data.address} ${data.city}, ${data.state}, ${data.zip}`,
        phoneNumber: data.phoneNumber,
        email: data.email,
        orderedItems: cartItems.map(item => {
          const quantity = quantities[item.id] ?? 0;
          return {
            foodId: item.id,
            quantity,
            price: item.price,
            category: item.category,
            imageUrl: item.imageUrl,
            description: item.description,
            name: item.name
          };
        }),
        amount: Number(total.toFixed(2)),
        orderStatus: "Preparing"
      };

      try {
        const response = await axios.post("http://localhost:8080/api/orders/create", orderData, {headers: {'Authorization': `Bearer ${token}`}});
        if(response.status === 201 && response.data.razorpayOrderId) {
          // Initiate the payment
          initiateRazorpayment(response.data);
        }
        else {
          toast.error("Unable to place order. Please try again.");
        }
      } catch {
        toast.error("Unable to place order. Please try again");
      }
    };

    const deleteOrder = async (orderId) => {
      try {
        await axios.delete("http://localhost:8080/api/orders/"+orderId, {headers: {'Authorization': `Bearer ${token}`}});
      } catch {
        toast.error("Something went wrong. Contact Support");
      }
    };

    const clearCart = async () => {
      try {
        await axios.delete("http://localhost:8080/api/cart", {headers: {'Authorization' : `Bearer ${token}`}});
        setQuantities({});
      } catch {
        toast.error("Error while clearing the cart");
      }
    };



    // Cart items
    const cartItems = foodList.filter(food => (quantities?.[food.id] ?? 0) > 0);

    // Calculations
    const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities);

  return (
    <div className="container mt-4">
      <div className="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle">
        {/* <button
          className="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center"
          id="bd-theme"
          type="button"
          aria-expanded="false"
          data-bs-toggle="dropdown"
          aria-label="Toggle theme (auto)"
        >
          <svg className="bi my-1 theme-icon-active" aria-hidden="true">
            <use href="#circle-half"></use>
          </svg>
          <span className="visually-hidden" id="bd-theme-text">
            Toggle theme
          </span>
        </button> */}
        <ul
          className="dropdown-menu dropdown-menu-end shadow"
          aria-labelledby="bd-theme-text"
        >
          <li>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center"
              data-bs-theme-value="light"
              aria-pressed="false"
            >
              <svg className="bi me-2 opacity-50" aria-hidden="true">
                <use href="#sun-fill"></use>
              </svg>
              Light
              <svg className="bi ms-auto d-none" aria-hidden="true">
                <use href="#check2"></use>
              </svg>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center"
              data-bs-theme-value="dark"
              aria-pressed="false"
            >
              <svg className="bi me-2 opacity-50" aria-hidden="true">
                <use href="#moon-stars-fill"></use>
              </svg>
              Dark
              <svg className="bi ms-auto d-none" aria-hidden="true">
                <use href="#check2"></use>
              </svg>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center active"
              data-bs-theme-value="auto"
              aria-pressed="true"
            >
              <svg className="bi me-2 opacity-50" aria-hidden="true">
                <use href="#circle-half"></use>
              </svg>
              Auto
              <svg className="bi ms-auto d-none" aria-hidden="true">
                <use href="#check2"></use>
              </svg>
            </button>
          </li>
        </ul>
      </div>

      <div className="container mt-4">
        <main>
            <div className="py-5 text-center">
            <img
                className="d-block mx-auto mb-2 rounded-3"
                src={assets.logo}
                alt=""
                width="98"
                height="98" 
            />
            <h1 className="h2">Checkout form</h1>
            <p className="lead">
            Almost there! Just confirm your order details and add your info so we can get your food and drinks to you fresh and on time. Once you place your order, we’ll send you a confirmation and keep you posted until it’s ready. Thanks for ordering with us!
            </p>
            </div>
          <div className="row g-5">
            <div className="col-md-5 col-lg-4 order-md-last">
              <h4 className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-primary">Your cart</span>
                <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
              </h4>
              <ul className="list-group mb-3">
                {cartItems.map(item => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                      <h6 className="my-0">{item.name}</h6>
                      <small className="text-body-secondary">Qty: {quantities[item.id]}</small>
                    </div>
                    <span className="text-body-secondary">${item.price * quantities[item.id]}</span>
                  </li>
                ))}
                <li className="list-group-item d-flex justify-content-between">
                    <div>
                        <span>Shipping</span>
                    </div>
                    <span className="text-body-secondary">${subtotal === 0 ? 0.0 : shipping.toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                    <div>
                        <span>Tax (10%)</span>
                    </div>
                    <span className="text-body-secondary">${tax.toFixed(2)}</span>
                </li>
                {/* <li className="list-group-item d-flex justify-content-between bg-body-tertiary">
                  <div className="text-success">
                    <h6 className="my-0">Promo code</h6>
                    <small>EXAMPLECODE</small>
                  </div>
                  <span className="text-success">−$5</span>
                </li> */}
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total (USD)</span> <strong>${total.toFixed(2)}</strong>
                </li>
              </ul>
              {/* <form className="card p-2">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Promo code"
                  />
                  <button type="submit" className="btn btn-secondary">
                    Redeem
                  </button>
                </div>
              </form> */}
            </div>
            <div className="col-md-7 col-lg-8">
              <h4 className="mb-3">Billing address</h4>
              <form className="needs-validation" onSubmit={onSubmitHandler}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label htmlFor="firstName" className="form-label">
                      First name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      placeholder=""
                      required
                      name="firstName"
                      onChange={onChangeHandler}
                      value={data.firstName}

                    />
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="lastName" className="form-label">
                      Last name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      placeholder=""
                      required
                      name="lastName"
                      onChange={onChangeHandler}
                      value={data.lastName}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <div className="input-group has-validation">
                      <span className="input-group-text">@</span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="you@example.com"
                        required
                        name="email"
                        onChange={onChangeHandler}
                        value={data.email}
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      placeholder="(919)123-4567"
                      name="phoneNumber"
                      onChange={onChangeHandler}
                      value={data.phoneNumber}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      placeholder="1234 Main St"
                      required
                      name="address"
                      onChange={onChangeHandler}
                      value={data.address}
                    />
                  </div>
                  {/* <div className="col-12">
                    <label htmlFor="address2" className="form-label">
                      Address 2
                      <span className="text-body-secondary">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address2"
                      placeholder="Apartment or suite"
                    />
                  </div> */}
                  <div className="col-md-5">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <select
                      className="form-select"
                      id="state"
                      required
                      name="state"
                      onChange={onChangeHandler}
                      value={data.state}
                    >
                      <option value="">Choose...</option>
                      {US_STATES.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <select
                      className="form-select"
                      id="city"
                      required
                      name="city"
                      onChange={onChangeHandler}
                      value={data.city}
                    >
                      <option value="">Choose...</option>
                      {NORTH_CAROLINA_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="zip" className="form-label">
                      Zip
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="zip"
                      placeholder=""
                      required
                      name="zip"
                      onChange={onChangeHandler}
                      value={data.zip}
                    />
                  </div>
                </div>
                <hr className="my-4" />

                <button className="w-100 btn btn-primary btn-lg" type="submit" disabled={cartItems.length === 0}>
                  Continue to checkout
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlaceOrder;
