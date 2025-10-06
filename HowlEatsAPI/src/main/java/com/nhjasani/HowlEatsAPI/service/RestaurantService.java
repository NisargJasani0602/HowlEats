package com.nhjasani.HowlEatsAPI.service;

import java.util.List;

import com.nhjasani.HowlEatsAPI.io.RestaurantRequest;
import com.nhjasani.HowlEatsAPI.io.RestaurantResponse;

public interface RestaurantService {
    List<RestaurantResponse> findNearby(RestaurantRequest request);
}
