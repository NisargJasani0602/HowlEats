package com.nhjasani.HowlEatsAPI.service;

import com.nhjasani.HowlEatsAPI.io.CartRequest;
import com.nhjasani.HowlEatsAPI.io.CartResponse;

public interface CartService {

    CartResponse addToCart(CartRequest request);

    CartResponse getCart();

    void clearCart();

    CartResponse removeFromCart(CartRequest cartRequest);
}
