package com.nhjasani.HowlEatsAPI.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "restaurants")
public class RestaurantEntity {
    @Id
    private String id;
    private String name;
    private String address;
    private String category;
    private double latitude;
    private double longitude;
    private double rating;
    private String phone;
    private String placeId;  // from Google Maps
}
