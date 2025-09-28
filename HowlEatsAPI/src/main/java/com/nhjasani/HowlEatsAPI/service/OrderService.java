package com.nhjasani.HowlEatsAPI.service;

import java.util.List;
import java.util.Map;

import com.nhjasani.HowlEatsAPI.io.OrderRequest;
import com.nhjasani.HowlEatsAPI.io.OrderResponse;

public interface OrderService {
    
    OrderResponse createOrderWithPayement(OrderRequest request);

    void verifyPayment(Map<String, String> paymentData, String status);

    List<OrderResponse> getUserOrders(); 

    void removeOrder(String orderId);

    List<OrderResponse> getOrdersOfAllUsers();

    void updateOrderStatus(String orderId, String status);
}
