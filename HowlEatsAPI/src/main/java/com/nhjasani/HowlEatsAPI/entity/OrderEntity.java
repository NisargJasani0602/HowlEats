package com.nhjasani.HowlEatsAPI.entity;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.nhjasani.HowlEatsAPI.io.OrderItem;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Document(collection = "orders")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderEntity {
    @Id
    private String id;
    private String userId;
    private String userAddress;
    private String phoneNumber;
    private String email;
    private List<OrderItem> orderedItems;
    private double amount;
    private String paymentStatus;
    private String razorpayOrderId;
    private String razorpaySignature;
    private String razorpayPaymentId;
    private String orderStatus;
}
