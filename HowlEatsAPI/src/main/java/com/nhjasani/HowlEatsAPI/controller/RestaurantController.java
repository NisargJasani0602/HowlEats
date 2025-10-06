package com.nhjasani.HowlEatsAPI.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nhjasani.HowlEatsAPI.io.RestaurantRequest;
import com.nhjasani.HowlEatsAPI.io.RestaurantResponse;
import com.nhjasani.HowlEatsAPI.service.RestaurantService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
@Validated
public class RestaurantController {
    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping("/nearby")
    public List<RestaurantResponse> findNearbyRestaurants(@Valid @ModelAttribute RestaurantRequest request) {
        return restaurantService.findNearby(request);
    }
}
