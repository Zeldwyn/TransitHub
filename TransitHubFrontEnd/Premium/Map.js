import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';

export default function Map() {
  const [startingLocation, setStartingLocation] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [destinationsNames, setDestinationsNames] = useState([]);
  const [showMore, setShowMore] = useState(false);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const apiKey = '5b3ce3597851110001cf62489f4d31d1f47f4772961b6a9a70c4dfa9'; // Replace with your API key
      const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lat=${latitude}&point.lon=${longitude}`;

      const response = await axios.get(url);
      const { features } = response.data;
      if (features && features.length > 0) {
        return features[0].properties.label;
      } else {
        return 'Unknown location';
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
      return 'Unknown location';
    }
  };

  useEffect(() => {
    const fetchDestinationsNames = async () => {
      const names = await getLocationNames([...destinations]);
      setDestinationsNames(names);
    };

    fetchDestinationsNames();
  }, [destinations]);

  const getLocationNames = async (coordinates) => {
    try {
      const apiKey = '5b3ce3597851110001cf62489f4d31d1f47f4772961b6a9a70c4dfa9'; // Replace with your API key
      const promises = coordinates.map(async (coordinate) => {
        const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lat=${coordinate.latitude}&point.lon=${coordinate.longitude}`;
        const response = await axios.get(url);
        const label = response.data.features[0].properties.label;
        return label;
      });
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching location names:', error);
      return Array(coordinates.length).fill('Unknown location');
    }
  };
  

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    if (!startingLocation) {
      setStartingLocation(coordinate);
    } else {
      setDestinations([...destinations, coordinate]);
    }
  };

  const getRoute = async () => {
    try {
      if (!startingLocation || destinations.length === 0) {
        console.error('Please select starting location and at least one destination');
        return;
      }

      const apiKey = '5b3ce3597851110001cf62489f4d31d1f47f4772961b6a9a70c4dfa9'; // Replace with your API key
      const profile = 'driving-car';
      const units = 'm';
      const language = 'en';
      const start = `${startingLocation.longitude},${startingLocation.latitude}`;

      let via = '';
      let end = '';

      if (destinations.length > 1) {
        via = destinations.slice(0, -1).map(destination => `${destination.longitude},${destination.latitude}`).join('|');
        end = `${destinations[destinations.length - 1].longitude},${destinations[destinations.length - 1].latitude}`;
      } else {
        end = `${destinations[0].longitude},${destinations[0].latitude}`;
      }

      const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}&start=${start}&end=${end}${via ? `&via=${via}` : ''}&units=${units}&language=${language}`;

      const response = await axios.get(url);
      const { features } = response.data;
      const routeCoordinates = features[0].geometry.coordinates.map(coord => ({ latitude: coord[1], longitude: coord[0] }));
      setCoordinates(routeCoordinates);
    } catch (error) {
      if (error.response) {
        console.error('Response error:', error.response.data);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      console.error('Error config:', error.config);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 10.3157,
          longitude: 123.8854,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {startingLocation && (
          <Marker coordinate={startingLocation} pinColor="blue" />
        )}
        {destinations.map((destination, index) => (
          <Marker key={index} coordinate={destination} pinColor="red" />
        ))}
        {coordinates.length > 0 && (
          <Polyline
            coordinates={coordinates}
            strokeWidth={4}
            strokeColor="red"
          />
        )}
      </MapView>
      <View style={styles.slideBar}>
  <View style={styles.labelContainer}>
    <Text style={styles.label}>Start:</Text>
    <Text style={styles.locationText}>
      {startingLocation ? (destinationsNames.length > 0 ? destinationsNames[0] : 'Start location') : 'Select a starting waypoint'}
    </Text>
  </View>
  {destinations.map((destination, index) => (
    <View style={styles.labelContainer} key={index}>
      <Text style={styles.label}>Route {index + 1}:</Text>
      <Text style={styles.locationText}>
        {destinationsNames[index + 1] || 'Select another destination'}
      </Text>
    </View>
  ))}
</View>



      <View style={styles.buttonContainer}>
        <Button title="Confirm Route" onPress={getRoute} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  slideBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationText: {
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  showMoreButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  showMoreButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  });
  