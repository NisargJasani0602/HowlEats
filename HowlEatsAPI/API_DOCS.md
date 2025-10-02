# 📘 HowlEats API

Base URL: `http://localhost:8080`

All secure routes expect the header `Authorization: Bearer <JWT>`. Tokens are issued by the login endpoint and expire after 10 hours.

---

## 🔐 Authentication & Users

### Register
```http
POST /api/register
```
**Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword"
}
```
**Response** `201 Created`
```json
{
  "id": "665f...",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Login
```http
POST /api/login
```
**Body**
```json
{
  "email": "john@example.com",
  "password": "mypassword"
}
```
**Response** `200 OK`
```json
{
  "email": "john@example.com",
  "token": "<JWT_TOKEN>"
}
```

---

## 🍔 Food

| Method & Path            | Description                              | Auth |
|-------------------------|------------------------------------------|------|
| `GET /api/foods`        | List all foods                           | none |
| `GET /api/foods/{id}`   | Get a single food item                   | none |
| `POST /api/foods`       | Create a food item (multipart upload)    | admin|
| `DELETE /api/foods/{id}`| Remove a food item                       | admin|

### Create Food (Admin)
`POST /api/foods`

- Content-Type: `multipart/form-data`
- Parts:
  - `food`: JSON stringified payload matching `FoodRequest`
  - `file`: image to upload (sent to S3)

Example `food` payload:
```json
{
  "name": "Paneer Tikka",
  "description": "Smoky paneer cubes",
  "price": 12.99,
  "category": "Indian"
}
```

---

## 🛒 Cart (Authenticated User)

| Method & Path            | Description                                       |
|-------------------------|---------------------------------------------------|
| `GET /api/cart`         | Fetch the caller's current cart (`items` map)     |
| `POST /api/cart`        | Increment quantity for a food (`{ "foodId": "..." }`) |
| `POST /api/cart/remove` | Decrement quantity for a food (`{ "foodId": "..." }`) |
| `DELETE /api/cart`      | Clear the cart                                    |

Responses are shaped like `CartResponse`:
```json
{
  "id": "66b8...",
  "userId": "65aa...",
  "items": {
    "foodId": 2
  }
}
```

---

## 📦 Orders

| Method & Path                        | Description                                                         | Auth |
|-------------------------------------|---------------------------------------------------------------------|------|
| `POST /api/orders/create`           | Creates an order and Razorpay order; returns payment details        | user |
| `POST /api/orders/verify`           | Verifies payment (expects Razorpay IDs & signature)                 | user |
| `GET /api/orders`                   | Lists the calling user's orders                                     | user |
| `DELETE /api/orders/{orderId}`      | Deletes an order (used when payment fails/cancelled)                | user |
| `GET /api/orders/all`               | List orders for every user                                          | admin|
| `PATCH /api/orders/status/{orderId}`| Update order status (`?status=Preparing|On Route|Delivered`)        | admin|

### Create Order
`POST /api/orders/create`
```json
{
  "userAddress": "123 Wolf St, Raleigh, NC",
  "phoneNumber": "5551234567",
  "email": "john@example.com",
  "amount": 42.75,
  "orderStatus": "Preparing",
  "orderedItems": [
    {
      "foodId": "662f...",
      "quantity": 2,
      "price": 12.5,
      "category": "Indian",
      "imageUrl": "https://...",
      "description": "Smoky paneer",
      "name": "Paneer Tikka"
    }
  ]
}
```
**Response** (excerpt)
```json
{
  "id": "66c0...",
  "razorpayOrderId": "order_Og...",
  "paymentStatus": "Created",
  "orderStatus": "Preparing",
  "amount": 42.75,
  "orderedItems": [ ... ]
}
```

### Verify Payment
`POST /api/orders/verify`
```json
{
  "razorpay_order_id": "order_Og...",
  "razorpay_payment_id": "pay_Og...",
  "razorpay_signature": "<signature>"
}
```
Validates the signature and marks the order `Paid`. If verification fails, the service throws and the order remains unchanged.

---

## 🔐 Authorization Notes
- Admin-only endpoints require the authenticated user to have the admin role (as configured in Spring Security).
- Delete endpoints return `204 No Content` when successful.
- Order status updates accept `Preparing`, `On Route`, or `Delivered`.

---

## 🧾 Response Models
- `UserResponse` & `AuthenticationResponse` surface minimal identity data.
- `CartResponse.items` is a `{ "foodId": quantity }` map.
- `OrderResponse` includes payment metadata (`paymentStatus`, `razorpayOrderId`).

---

## 🧭 Troubleshooting
- `401 Unauthorized` usually means the JWT expired; re-login and retry.
- `400 Bad Request` indicates missing IDs or malformed JSON (see cart and food controllers).
- Razorpay failures trigger `Payment Failed` toast in the client; check `/api/orders/verify` responses and order status.
