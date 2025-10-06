package com.nhjasani.HowlEatsAPI.io;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RestaurantResponse {
    private String id;
    private String name;
    private String address;
    private String category;
    private double latitude;
    private double longitude;
    private double rating;
    private String phone;
    private String placeId;
    // optional computed
    private Double distanceMeters; 
}
