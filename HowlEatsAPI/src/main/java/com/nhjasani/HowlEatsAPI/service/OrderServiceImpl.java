package com.nhjasani.HowlEatsAPI.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nhjasani.HowlEatsAPI.entity.OrderEntity;
import com.nhjasani.HowlEatsAPI.io.OrderRequest;
import com.nhjasani.HowlEatsAPI.io.OrderResponse;
import com.nhjasani.HowlEatsAPI.repository.CartRepository;
import com.nhjasani.HowlEatsAPI.repository.OrderRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);
 
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private CartRepository cartRepository;

    @Value("${razorpay_key}")
    private String RAZORPAY_KEY;

    @Value("${razorpay_secret}")
    private String RAZORPAY_SECRET;

    @Override
    public OrderResponse createOrderWithPayement(OrderRequest request) {
        String loggedInUserId = userService.findByUserId();
        OrderEntity newOrder = convertToEntity(request);
        newOrder.setUserId(loggedInUserId);
        newOrder.setPaymentStatus("PENDING");
        newOrder = orderRepository.save(newOrder);

        try {
            RazorpayClient razorpayClient = new RazorpayClient(RAZORPAY_KEY, RAZORPAY_SECRET);
            JSONObject orderRequest = new JSONObject();
            long amountInCents = Math.round(newOrder.getAmount() * 100);
            orderRequest.put("amount", amountInCents);
            orderRequest.put("currency", "USD");
            orderRequest.put("payment_capture", 1);

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            newOrder.setRazorpayOrderId(razorpayOrder.get("id"));
            newOrder = orderRepository.save(newOrder);
            return convertToResponse(newOrder);
        } catch (RazorpayException ex) {
            logger.error("Failed to create Razorpay order", ex);
            orderRepository.deleteById(newOrder.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    @Override
    public List<OrderResponse> getUserOrders() {
        String loggedInUserId = userService.findByUserId();
        List<OrderEntity> list = orderRepository.findByUserId(loggedInUserId);
        return list.stream().map(entity -> convertToResponse(entity)).collect(Collectors.toList());
    }

    @Override
    public void verifyPayment(Map<String, String> paymentData, String status) {
        String razorpayOrderId = paymentData.get("razorpay_order_id");
        OrderEntity existingOrder = orderRepository.findByRazorpayOrderId(razorpayOrderId)
            .orElseThrow(() -> new RuntimeException("OrderId not found"));
            existingOrder.setPaymentStatus(status);
            existingOrder.setRazorpaySignature(paymentData.get("razorpay_signature"));
            existingOrder.setRazorpayPaymentId(paymentData.get("razorpay_payment_id"));
            orderRepository.save(existingOrder);
        
        if("paid".equalsIgnoreCase(status)) {
            cartRepository.deleteByUserId(existingOrder.getUserId());
        }
    }

    @Override
    public void removeOrder(String orderId) {
        orderRepository.deleteById(orderId);
    }

    @Override
    public List<OrderResponse> getOrdersOfAllUsers() {
       List<OrderEntity> list = orderRepository.findAll();
       return list.stream().map(entity -> convertToResponse(entity)).collect(Collectors.toList());
    }

    @Override
    public void updateOrderStatus(String orderId, String status) {
        OrderEntity entity = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        entity.setOrderStatus(status);
        orderRepository.save(entity);
    }

    private OrderResponse convertToResponse(OrderEntity newOrder) {
        return OrderResponse.builder()
                .id(newOrder.getId())
                .amount(newOrder.getAmount())
                .userAddress(newOrder.getUserAddress())
                .userId(newOrder.getUserId())
                .razorpayOrderId(newOrder.getRazorpayOrderId())
                .paymentStatus(newOrder.getPaymentStatus())
                .orderStatus(newOrder.getOrderStatus())
                .email(newOrder.getEmail())
                .phoneNumber(newOrder.getPhoneNumber())
                .orderedItems(newOrder.getOrderedItems())
                .build();
    }

    private OrderEntity convertToEntity(OrderRequest request) {
        return OrderEntity.builder()
                .userAddress(request.getUserAddress())
                .amount(request.getAmount())
                .orderedItems(request.getOrderedItems())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .orderStatus(request.getOrderStatus())
                .build();
    }

}
