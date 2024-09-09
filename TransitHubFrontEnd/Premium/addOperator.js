import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Text, FlatList, Keyboard } from "react-native";
import { Menu, MenuItem } from 'react-native-material-menu';
import Ionicons from '@expo/vector-icons/Ionicons';
import config from '../config';
import { Modal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function AddOperator() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [displayInvites, setDisplayInvites] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [clickedButtons, setClickedButtons] = useState({});
  const [pID, setPID] = useState('');
  const [visibleMenuId, setVisibleMenuId] = useState(null); 
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOperatorID, setSelectedOperatorID] = useState(null);
  const [alertMsg, setAlertMessage] = useState('');
  useEffect(() => {
    const getUserID = async () => {
      const id = await AsyncStorage.getItem('premiumUserID');
      console.log("ID: ", id);
      setPID(id);
    };
    getUserID();
  }, []);

  useEffect(() => {
    if (pID) {
      fetch(`${config.BASE_URL}/list-Operator?premiumUserID=${parseInt(pID)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      })
      .then(response => response.text().then(text => {
        console.log('Raw response:', text);
        return JSON.parse(text);
      }))
      .then(data => {
        setDisplayInvites(data);
      })
      .catch(error => {
        console.error('Error fetching data from Express backend:', error);
      });
    }
  }, [pID, showResults, selectedOperatorID]);

  const handleConfirm = async () => {
    console.log('Confirmed');
    if (pID && selectedOperatorID) {
      try {
        const url = `${config.BASE_URL}/delete-Operator?premiumUserID=${pID}&operatorID=${selectedOperatorID}`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Response from server:', data);

        setAlertMessage('Operator deleted successfully');
      } catch (error) {
        console.error('Error deleting operator:', error);
        setAlertMessage('Failed to delete operator');
      }
    }
    setTimeout(() => {
      setShowConfirmation(false);
      setSelectedOperatorID(null); 
    }, 1500);
  };

  const handleClose = () => {
    setShowConfirmation(false);
    
  };
  
  const handleSubmit = async () => {
    console.log('Search:', search);
    Keyboard.dismiss();
    if (search.trim() === '') {
      setSearchResults([]);
      setShowResults(true);
      return;
    }
    try {
      const response = await fetch(`${config.BASE_URL}/search-Operator?search=${search}&premiumUserID=${pID}`, {
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
        setShowResults(false);
      } else {
        setSearch('');
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleMessage = async(operatorID,firstName,lastName) => {
    try {
      const response = await fetch(`${config.BASE_URL}/get-ConversationID`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          premiumUserID: parseInt(pID),
          operatorID: operatorID,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`Conversation ID: ${data.conversationID}`);
        console.log(`Operator ID: ${operatorID}`);
        await AsyncStorage.setItem('ConversationID', data.conversationID.toString());
        await AsyncStorage.setItem('OperatorID', operatorID.toString());
        await AsyncStorage.setItem('CurrentName', firstName + ' ' + lastName);
        navigation.navigate('MessageOwner')
      } 
    } catch (error) {
        console.error('Error fetching conversation ID:', error);
    }
  };

  const addOperator = async (operatorID) => {
    try {
      const response = await fetch(`${config.BASE_URL}/add-Operator`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          premiumUserID: parseInt(pID),
          operatorID: operatorID,
        }),
      });
      const data = await response.json();
      console.log('Response from Express backend:', data);
      if (data.status === '1') {
        console.log('Operator added successfully');
        setClickedButtons(prevState => ({
          ...prevState,
          [operatorID]: true,
        }));
      } else if (data.status === '0') {
        console.log('Error adding operator');
      }
    } catch (error) {
      console.error('Error posting data to Express backend:', error);
    }
  };

  const renderSearch = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <TouchableOpacity style={styles.inviteBtn} onPress={() => addOperator(item.operatorID)} >
        <Text style={styles.status}>{clickedButtons[item.operatorID] ? "Sent" : "Invite"}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInvite = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <Menu
        visible={visibleMenuId === item.operatorID} 
        anchor={<Ionicons name="menu" size={24} color="black" onPress={() => {setVisibleMenuId(item.operatorID), setAlertMessage('Confirm Removal of Operator?')}}/>}
        
        onRequestClose={() => setVisibleMenuId(null)}
      >
        <MenuItem onPress={() => {  handleMessage(item.operatorID, item.firstName, item.lastName) ,setVisibleMenuId(null); }}>Message</MenuItem>
        <MenuItem onPress={() => { 
        setSelectedOperatorID(item.operatorID); 
        setShowConfirmation(true); 
        setVisibleMenuId(null); 
        }}>Remove</MenuItem>
      </Menu>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSubmit}>
          <Text style={styles.btnTxt}>Search</Text>
        </TouchableOpacity>
      </View>
      {showResults ? (
        <>
          <Text style={styles.sentLabel}>Search Results</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearch}
            keyExtractor={(item) => item.email.toString()}
          />
          <TouchableOpacity style={styles.clearBtn} onPress={() => setShowResults(false)}>
            <Text style={styles.btnTxt}>Close</Text>
          </TouchableOpacity>
        </>
      ) : (
        <FlatList
          data={displayInvites}
          renderItem={renderInvite}
          keyExtractor={(item) => item.operatorID.toString()}
        />
      )}
      <Modal
        transparent={true}
        visible={showConfirmation}
        animationType="slide"
        onDismiss={handleClose}
      >
      <View style={styles.modalContainer} onPressOut={() => handleClose()}>
        <View style={styles.modalContent}>
          <Text style={styles.messageText}>{alertMsg}</Text>
            <TouchableOpacity style={styles.searchButton} onPress={() => {handleConfirm()}}>
              <Text style={styles.btnTxt}>Confirm</Text>
            </TouchableOpacity>
        </View>
      </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    margin: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 8,
  },
  searchButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'maroon',
    borderRadius: 5,
    marginBottom: 8,
  },
  btnTxt: {
    color: '#fff',
    fontWeight: '400',
  },
  status: {
    color: '#fff',
    fontWeight: 'bold',
    width: 36,
    textAlign: 'center'
  },
  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'maroon',
    borderRadius: 5,
    marginBottom: 8,
    alignItems: 'center'
  },
  inviteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'maroon',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'maroon',
    backgroundColor: '#fff',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  sentLabel: {
    fontWeight: 'bold', 
    fontSize: 20, 
    alignSelf: 'center', 
    marginTop: 20, 
    marginBottom: 20
  },
  email: {
    fontSize: 12.5,
  },
  name: {
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -200
  },
  modalContent: {
    width: 280,
    height: 200,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 30,
  },
});
