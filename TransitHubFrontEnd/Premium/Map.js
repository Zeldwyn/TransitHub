import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Image, Dimensions, Animated, TouchableOpacity, Modal, TextInput } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [packageWidth, setPackageWidth] = useState('');
  const [packageHeight, setPackageHeight] = useState('');
  const [packageWeight, setPackageWeight] = useState('');
  const [packageWidthUnit, setPackageWidthUnit] = useState('inches');
  const [packageHeightUnit, setPackageHeightUnit] = useState('inches');
  const [packageWeightUnit, setPackageWeightUnit] = useState('Kg');
  const [first2KmRate, setFirst2KmRate] = useState('');
  const [succeedingKmRate, setSucceedingKmRate] = useState('');
  const [fuelSurcharge, setFuelSurcharge] = useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [totalFee, setTotalFee] = useState('');

  useEffect(() => {
    const toValue = isInputAreaExpanded
      ? (currentPage === 1 || currentPage === 4
        ? Dimensions.get('window').height - 420
        : currentPage === 2
          ? Dimensions.get('window').height - 320
          : currentPage === 3
            ? Dimensions.get('window').height - 400
            : 100)
      : 100;
  
    Animated.timing(inputAreaHeight, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isInputAreaExpanded, currentPage]);

  useEffect(() => {
    checkInputsFilled();
    calculateTotalFee();
  }, [startLocationName, endLocationName, packageWidth, packageHeight, packageWeight, first2KmRate, succeedingKmRate, fuelSurcharge, currentPage])

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

  const getDynamicBuffer = () => {
    const now = new Date();
    const currentHour = now.getHours();

    const morningRushHourBuffer = 45 * 60; // 45 minutes
    const eveningRushHourBuffer = 45 * 60; // 45 minutes
    const daytimeBuffer = 20 * 60; // 20 minutes
    const nightTimeBuffer = 10 * 60; // 10 minutes
  
    if (currentHour >= 7 && currentHour < 10) {
      return morningRushHourBuffer;
    } else if (currentHour >= 16 && currentHour < 19) {
      return eveningRushHourBuffer;
    } else if (currentHour >= 10 && currentHour < 16) {
      return daytimeBuffer;
    } else {
      return nightTimeBuffer;
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
      const route = response.data.features[0].properties.segments[0];
      const routeCoordinates = response.data.features[0].geometry.coordinates.map(coord => ({ latitude: coord[1], longitude: coord[0] }));
      setCoordinates(routeCoordinates);

      const dynamicBuffer = getDynamicBuffer();
      const adjustedDuration = route.duration + dynamicBuffer;

      setDuration(adjustedDuration);
      setDistance(route.distance / 1000); // Distance in kilometers

      calculateTotalFee(route.distance / 1000);
      setCurrentPage(2);
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  
  

  const calculateTotalFee = () => {
    try {
      const first2KmFee = parseFloat(first2KmRate);
      const succeedingKmFee = parseFloat(succeedingKmRate);
      const fuelSurchargeFee = parseFloat(fuelSurcharge);
  
      let fee = 0;
  
      const convertedWidth = convertDimensionToInches(packageWidth, packageWidthUnit);
      const convertedHeight = convertDimensionToInches(packageHeight, packageHeightUnit);
      const convertedWeight = convertWeightToKg(packageWeight, packageWeightUnit);
  
      if (distance <= 2) {
        fee = first2KmFee;
      } else {
        fee = first2KmFee + (distance - 2) * succeedingKmFee;
      }
  
      fee += fuelSurchargeFee;
      fee += calculatePackageFee(convertedWidth, convertedHeight, convertedWeight);
  
      setTotalFee(fee.toFixed(2));
    } catch (error) {
      console.error('Error calculating total fee:', error);
    }
  };
  
  
  const convertDimensionToInches = (value, unit) => {
    switch (unit) {
      case 'centimeter':
        return value / 2.54;
      default:
        return value; 
    }
  };
  
  const convertWeightToKg = (value, unit) => {
    switch (unit) {
      case 'pound':
        return value / 2.20462; 
      default:
        return value; 
    }
  };
  
  const calculatePackageFee = (width, height, weight) => {
    const volume = width * height * weight; 
    const feePerCubicUnit = 0.1; 
    return volume * feePerCubicUnit; 
  };

  const checkInputsFilled = () => {
    if (currentPage === 1) {
      setIsConfirmDisabled(!startLocationName || !endLocationName);
    } else if (currentPage === 2) {
      setIsConfirmDisabled(!packageWidth || !packageHeight || !packageWeight);
    } else if (currentPage === 3) {
      setIsConfirmDisabled(!first2KmRate || !succeedingKmRate || !fuelSurcharge);
    } else {
      setIsConfirmDisabled(false);
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
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
            <Button title="Confirm" onPress={getRoute} color="#8a252c" disabled={isConfirmDisabled} />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.pageText}>Package Width:</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.inputBox}
                keyboardType="numeric"
                value={packageWidth}
                onChangeText={setPackageWidth}
              />
              <Picker
                selectedValue={packageWidthUnit}
                style={{ height: 50, width: 103 }}
                onValueChange={(widthunit) => setPackageWidthUnit(widthunit)}
              >
                <Picker.Item label="In" value="inch" />
                <Picker.Item label="Cm" value="centimeter" />
              </Picker>
            </View>
            <Text style={styles.pageText}>Package height:</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.inputBox}
                keyboardType="numeric"
                value={packageHeight}
                onChangeText={setPackageHeight}
              />
              <Picker
                selectedValue={packageHeightUnit}
                style={{ height: 50, width: 103 }}
                onValueChange={(heightunit) => setPackageHeightUnit(heightunit)}
              >
                <Picker.Item label="In" value="inch" />
                <Picker.Item label="cm" value="centimeter" />
              </Picker>
            </View>
            <Text style={styles.pageText}>Package Weight:</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.inputBox}
                keyboardType="numeric"
                value={packageWeight}
                onChangeText={setPackageWeight}
              />
              <Picker
                selectedValue={packageWeightUnit}
                style={{ height: 50, width: 103 }}
                onValueChange={(weightunit) => setPackageWeightUnit(weightunit)}
              >
                <Picker.Item label="Kg" value="kilogram" />
                <Picker.Item label="Lb" value="pound" />
              </Picker>
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Previous" onPress={() => setCurrentPage(1)} color="#8a252c" />
              <Button title="Confirm" onPress={() => setCurrentPage(3)} color="#8a252c" disabled={isConfirmDisabled} />
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text>Fuel Surcharge:</Text>
            <TextInput
              style={styles.inputBox}
              keyboardType="numeric"
              value={fuelSurcharge}
              onChangeText={setFuelSurcharge}
            />
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
              <Button title="Previous" onPress={() => setCurrentPage(2)} color="#8a252c" />
              <Button title="Confirm" onPress={() => setCurrentPage(4)} color="#8a252c" disabled={isConfirmDisabled} />
            </View>
          </>
        );
      case 4:
        return (
          <>
            <Text>Duration: {duration ? `${(duration / 60).toFixed(2)} minutes` : ''}</Text>
            <Text>Distance: {distance ? `${distance.toFixed(2)} km` : ''}</Text>
            <Text>Total Fee: {totalFee ? `₱${totalFee}` : ''}</Text>
            <Button title="Previous" onPress={() => setCurrentPage(3)} color="#8a252c" />
          </>
        );
      default:
        return null;
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
          {renderPageContent()}
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
    flexDirection: 'row',
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
    width: "70%",
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    height: 40,
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
