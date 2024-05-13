// import React, { useState, useRef } from 'react';
// import { StyleSheet, View, TextInput, Button, Text, Image, Dimensions, Animated, TouchableOpacity } from 'react-native';
// import MapboxGL from '@react-native-mapbox-gl/maps';

// MapboxGL.setAccessToken('pk.eyJ1Ijoia2V2aW5kdW1vIiwiYSI6ImNsdzJ6d3pyMjBsMzYya211eHlwbmRqM2sifQ.CHFO4d_cZWYaEYIz6wQVUg');

// export default function GuestMap() {
//   const [from, setFrom] = useState('');
//   const [to, setTo] = useState('');
//   const [coordinates, setCoordinates] = useState([]);
//   const [isInputAreaExpanded, setIsInputAreaExpanded] = useState(false);
//   const inputAreaHeight = useRef(new Animated.Value(100)).current;

//   const toggleInputArea = () => {
//     if (isInputAreaExpanded) {
//       Animated.timing(inputAreaHeight, {
//         toValue: 100,
//         duration: 150,
//         useNativeDriver: false,
//       }).start();
//     } else {
//       Animated.timing(inputAreaHeight, {
//         toValue: Dimensions.get('window').height - 450,
//         duration: 150,
//         useNativeDriver: false,
//       }).start();
//     }
//     setIsInputAreaExpanded(!isInputAreaExpanded);
//   };

//   const handleMapPress = (event) => {
//     const { locationX, locationY } = event.nativeEvent;
//     const isInsideInputArea = (
//       locationY > windowHeight - inputAreaHeight._value &&
//       locationX > 0 &&
//       locationX < windowWidth
//     );
  
//     if (!isInsideInputArea && isInputAreaExpanded) {
//       toggleInputArea();
//     }
//   };

//   const windowWidth = Dimensions.get('window').width;
//   const windowHeight = Dimensions.get('window').height;

//   return (
//     <View style={styles.container}>
//       <MapboxGL.MapView
//         style={styles.map}
//         styleURL={MapboxGL.StyleURL.Street} // Example of using a street style
//         onPress={handleMapPress}
//         >
//         {/* Add your MapboxGL components here */}
//       </MapboxGL.MapView>
//       <Animated.View style={[styles.inputContainer, { height: inputAreaHeight }]}>
//         <TouchableOpacity onPress={toggleInputArea} activeOpacity={1}>
//           <Image
//             style={{
//               ...styles.logo,
//               width: windowWidth * 1, 
//               height: windowHeight * 0.1, 
//             }}
//             source={require('../assets/img/blackText.png')}
//           />
//           <Text style={styles.label} onPress={(event) => event.stopPropagation()}>From:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Start Location"
//             value={from}
//             onChangeText={setFrom}
//           />
//           <Text style={styles.label} onPress={(event) => event.stopPropagation()}>To:</Text> 
//           <TextInput
//             style={styles.input}
//             placeholder="Enter End Location"
//             value={to}
//             onChangeText={setTo}
//           />
//           <Button title="Confirm" onPress={toggleInputArea} color="#8a252c" />
//         </TouchableOpacity>
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   inputContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     padding: 10,
//     justifyContent: 'space-between',
//     borderTopLeftRadius: 15,
//     borderTopRightRadius: 15,
//     borderBottomLeftRadius: 0,
//     borderBottomRightRadius: 0,
//     backgroundColor: 'white',
//   },
//   label: {
//     fontWeight: 'bold',
//     marginBottom: 10,
//     marginRight: 5,
//   },
//   input: {
//     marginHorizontal: 5,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     padding: 5,
//     marginBottom: 10,
//   },
//   logo: {
//     alignSelf: 'center', 
//     marginBottom: 10, 
//   }, 
// });
