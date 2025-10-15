package com.nhjasani.HowlEatsAPI.util;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import com.nhjasani.HowlEatsAPI.entity.RestaurantEntity;

@Component
public class GoogleMapsClient {
    @Value("${google.api.key}")
    private String apiKey;

    @Value("${google.places.radius:2000}")
    private Integer radiusMeters;

    public List<RestaurantEntity> fetchNearbyRestaurants(String category, double lat, double lng) {
        String encodedKeyword = URLEncoder.encode(category, StandardCharsets.UTF_8);
        String url = String.format(
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=%f,%f&radius=%d&type=restaurant&keyword=%s&key=%s",
                lat, lng, radiusMeters, encodedKeyword, apiKey);

        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.getForObject(url, String.class);

        JSONObject json = new JSONObject(response);
        JSONArray results = json.getJSONArray("results");

        List<RestaurantEntity> restaurantList = new ArrayList<>();
        for (int i = 0; i < results.length(); i++) {
            JSONObject item = results.getJSONObject(i);
            RestaurantEntity r = new RestaurantEntity();
            r.setName(item.getString("name"));
            r.setAddress(item.optString("vicinity"));
            r.setRating(item.optDouble("rating", 0.0));
            r.setLatitude(item.getJSONObject("geometry").getJSONObject("location").getDouble("lat"));
            r.setLongitude(item.getJSONObject("geometry").getJSONObject("location").getDouble("lng"));
            r.setCategory(category);
            r.setPhone(item.optString("formatted_phone_number", null));
            r.setPlaceId(item.getString("place_id"));
            JSONArray photos = item.optJSONArray("photos");
            if (photos != null && photos.length() > 0) {
                String photoRef = photos.getJSONObject(0).optString("photo_reference", null);
                r.setPhotoReference(photoRef);
            }
            restaurantList.add(r);
        }
        return restaurantList;
    }
}
