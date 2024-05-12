import React, { useState, useRef } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Keyboard, Modal, Text, TouchableWithoutFeedback, ScrollView } from "react-native";
import { Feather } from '@expo/vector-icons';

export default function AddOperator() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const textInputRef = useRef(null);

  const handleContainerPress = () => {
      Keyboard.dismiss();
      if (textInputRef.current) {
        textInputRef.current.clear();
      }
  };
  const handleSubmit = async (query) => {
    if (query.trim() === '') {
      setSearchResults(['Sorry, email does not exist!']);
      setModalVisible(false);
      return; 
    }
    try {
      const response = await fetch(`http://192.168.1.8:8080/search-Operator?search=${query}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Response from Express backend:', data);
  
      if (data.length === 0) {
        setSearchResults(['Sorry, email does not exist!']);
      } else {
        setSearchResults(data);
      }
      setModalVisible(true);
  
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
  

  const closeModal = () => {
    handleContainerPress();
    setModalVisible(false);
  };

  return (
      <TouchableWithoutFeedback onPress={handleContainerPress}>
        <View style={styles.container}>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={textInputRef}
                style={[styles.input, { flex: 1 }]}
                value={search}
                onChangeText={setSearch}
                placeholder=" Search Email Here.."
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => handleSubmit(search)}>
                <Feather name="search" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={closeModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {searchResults.map((result, index) => (
                      <Text key={index}>{result}</Text>
                    ))}
                  </ScrollView>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButtonContainer}>
                    <Text style={styles.closeButton}>Close</Text>
                  </TouchableOpacity>              
                </View>
              </View>
            </Modal>
        </View>
      </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3B130',
    alignItems: 'center',
    justifyContent: 'flex-start',
},
input: {
    height: 40,
    width: 300,
    borderRadius: 5,
    borderColor: 'white',
    backgroundColor: 'orange',
    margin: 12,
    borderWidth: 1,
    padding: 10,
    textAlign: 'left',
},
passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    marginTop: 50,
    position: 'relative', 
},
eyeIcon: {
    position: 'absolute',
    top: 20,
    right: 25,
},
modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)', 
},
modalContent: {
  width: 400, 
  height: 300, 
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 10,
  elevation: 10, 
  shadowColor: '#000', 
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  alignItems: 'left',
},     
scrollViewContent: {
  flexGrow: 1,
  alignItems: 'baseline',
},
closeButtonContainer: {
  position: 'absolute',
  bottom: 20, // Adjust as needed
  alignSelf: 'center', // Center horizontally
},
closeButton: {
  color: 'blue',
},
});


// HIMUON OG TOUCHABLE OPACITY ANG RESULT PARA MAPISLIT SIYA FOR SENDING INVITATION OR ADDING OKAY ?
// NYA DISPLAY SA GI SENDAN OG INVITATION WITH LABEL PENDING AND ACCEPTED ?