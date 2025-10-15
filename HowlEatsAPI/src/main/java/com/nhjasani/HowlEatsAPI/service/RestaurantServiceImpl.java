package com.nhjasani.HowlEatsAPI.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nhjasani.HowlEatsAPI.entity.RestaurantEntity;
import com.nhjasani.HowlEatsAPI.io.RestaurantRequest;
import com.nhjasani.HowlEatsAPI.io.RestaurantResponse;
import com.nhjasani.HowlEatsAPI.util.GoogleMapsClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final GoogleMapsClient googleMapsClient;

    @Override
    public List<RestaurantResponse> findNearby(RestaurantRequest request) {
        List<RestaurantEntity> fetched = googleMapsClient.fetchNearbyRestaurants(
                request.getCategory(),
                request.getLatitude(),
                request.getLongitude());

        return fetched.stream()
                .map(entity -> toResponse(entity, request.getLatitude(), request.getLongitude()))
                .toList();
    }

    private static RestaurantResponse toResponse(RestaurantEntity entity, double originLat, double originLng) {
        return RestaurantResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .address(entity.getAddress())
                .category(entity.getCategory())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .rating(entity.getRating())
                .phone(entity.getPhone())
                .placeId(entity.getPlaceId())
                .photoReference(entity.getPhotoReference())
                .distanceMeters(distanceMeters(originLat, originLng, entity.getLatitude(), entity.getLongitude()))
                .build();
    }

    private static double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6_371_000 * c;
    }
}
