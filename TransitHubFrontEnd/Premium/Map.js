import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Image, Dimensions, Animated, TouchableOpacity, Modal, TextInput } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import axios from 'axios';

export default function Map() {
  const [startingLocation, setStartingLocation] = useState(null);
  const [endingLocation, setEndingLocation] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [isInputAreaExpanded, setIsInputAreaExpanded] = useState(false);
  const inputAreaHeight = useRef(new Animated.Value(100)).current;
  const [isSelectingStart, setIsSelectingStart] = useState(false);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);
  const [startLocationName, setStartLocationName] = useState('Select a starting waypoint');
  const [endLocationName, setEndLocationName] = useState('Select an ending waypoint');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNextPage, setShowNextPage] = useState(false);
  const [packageWeight, setPackageWeight] = useState('');
  const [first2KmRate, setFirst2KmRate] = useState('');
  const [succeedingKmRate, setSucceedingKmRate] = useState('');

  useEffect(() => {
    const toValue = isInputAreaExpanded
      ? (showNextPage ? Dimensions.get('window').height - 340 : Dimensions.get('window').height - 420)
      : 100;

    Animated.timing(inputAreaHeight, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isInputAreaExpanded, showNextPage]);

  const toggleInputArea = () => {
    setIsInputAreaExpanded(!isInputAreaExpanded);
  };

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    if (isSelectingStart) {
      setStartingLocation(coordinate);
      setStartLocationName(await reverseGeocode(coordinate.latitude, coordinate.longitude));
      setIsSelectingStart(false);
    } else if (isSelectingEnd) {
      setEndingLocation(coordinate);
      setEndLocationName(await reverseGeocode(coordinate.latitude, coordinate.longitude));
      setIsSelectingEnd(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const apiKey = '5b3ce3597851110001cf62489f4d31d1f47f4772961b6a9a70c4dfa9';
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

  const getRoute = async () => {
    try {
      if (!startingLocation || !endingLocation) {
        setErrorMessage('Please select both starting and ending locations');
        setErrorModalVisible(true);
        return;
      }

      const apiKey = '5b3ce3597851110001cf62489f4d31d1f47f4772961b6a9a70c4dfa9';
      const profile = 'driving-car';
      const start = `${startingLocation.longitude},${startingLocation.latitude}`;
      const end = `${endingLocation.longitude},${endingLocation.latitude}`;

      const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}&start=${start}&end=${end}`;

      const response = await axios.get(url);
      const routeCoordinates = response.data.features[0].geometry.coordinates.map(coord => ({ latitude: coord[1], longitude: coord[0] }));
      setCoordinates(routeCoordinates);
      setShowNextPage(true);
    } catch (error) {
      console.error('Error fetching route:', error);
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
        //customMapStyle={customMapStyle}
      >
        {startingLocation && (
          <Marker coordinate={startingLocation} pinColor="blue" />
        )}
        {endingLocation && (
          <Marker coordinate={endingLocation} pinColor="red" />
        )}
        {coordinates.length > 0 && (
          <Polyline
            coordinates={coordinates}
            strokeWidth={4}
            strokeColor="red"
          />
        )}
      </MapView>
      <Animated.View style={[styles.inputContainer, { height: inputAreaHeight }]}>
        <TouchableOpacity onPress={toggleInputArea} activeOpacity={1}>
          <Image
            style={{
              ...styles.logo,
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height * 0.1,
            }}
            source={require('../assets/img/blackText.png')}
          />
          {!showNextPage && (
            <>
              <Text style={styles.label}>Start:</Text>
              <View style={styles.row}>
                <Text style={styles.locationText}>{startLocationName}</Text>
                <Button title="Set" onPress={() => setIsSelectingStart(true)} color="#8a252c"/>
              </View>
              <Text style={styles.label}>End:</Text>
              <View style={styles.row}>
                <Text style={styles.locationText}>{endLocationName}</Text>
                <Button title="Set" onPress={() => setIsSelectingEnd(true)} color="#8a252c" />
              </View>
            </>
          )}
          {!showNextPage && <Button title="Confirm" onPress={getRoute} color="#8a252c" />}
          {showNextPage && (
            <>
              <Text style={styles.pageText}>Weight of package(Kg):</Text>
              <TextInput
                style={styles.inputBox}
                keyboardType="numeric"
                value={packageWeight}
                onChangeText={setPackageWeight}
              />
              <Text style={styles.boldText}>Rate</Text>
              <Text>First 2Km:</Text>
              <TextInput
                style={styles.inputBox}
                keyboardType="numeric"
                value={first2KmRate}
                onChangeText={setFirst2KmRate}
              />
              <Text>Succeeding Km:</Text>
              <TextInput
                style={styles.inputBox}
                keyboardType="numeric"
                value={succeedingKmRate}
                onChangeText={setSucceedingKmRate}
              />
              <View style={styles.buttonContainer}>
                <Button title="Back" onPress={() => setShowNextPage(false)} color="#8a252c" />
                <Button title="Confirm" onPress={() => console.log("Confirm")} color="#8a252c" />
              </View>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
      <Modal
        animationType="none"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <Button title="OK" onPress={() => setErrorModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'space-between',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: 'white',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 10,
    marginRight: 5,
  },
  row: {
    flexDirection:
      'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  nextPageContainer: {
    padding: 10,
  },
  pageText: {
    marginBottom: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },

});