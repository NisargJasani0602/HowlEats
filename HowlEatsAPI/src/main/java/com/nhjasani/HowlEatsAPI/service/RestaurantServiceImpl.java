package com.nhjasani.HowlEatsAPI.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.nhjasani.HowlEatsAPI.entity.RestaurantEntity;
import com.nhjasani.HowlEatsAPI.io.RestaurantRequest;
import com.nhjasani.HowlEatsAPI.io.RestaurantResponse;
import com.nhjasani.HowlEatsAPI.repository.RestaurantRepository;
import com.nhjasani.HowlEatsAPI.util.GoogleMapsClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final GoogleMapsClient googleMapsClient;

    @Override
    public List<RestaurantResponse> findNearby(RestaurantRequest request) {
        List<RestaurantEntity> fetched = googleMapsClient.fetchNearbyRestaurants(
                request.getCategory(),
                request.getLatitude(),
                request.getLongitude());

        List<RestaurantEntity> saved = restaurantRepository.saveAll(fetched); // cache response

        return saved.stream()
                .map(RestaurantServiceImpl::toResponse)
                .toList();
    }

    private static RestaurantResponse toResponse(RestaurantEntity entity) {
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
                .build();
    }
}
