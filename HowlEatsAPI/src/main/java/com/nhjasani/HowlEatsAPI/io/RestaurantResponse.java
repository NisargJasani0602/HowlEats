package com.nhjasani.HowlEatsAPI.io;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
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
    private String photoReference;
    private Double distanceMeters; 
}
