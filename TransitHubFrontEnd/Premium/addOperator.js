import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Keyboard, Modal, Text, TouchableWithoutFeedback, ScrollView, FlatList, Button } from "react-native";

export default function AddOperator() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [displayInvites, setDisplayInvites] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [clickedButtons ,setClickedButtons] = useState({});
  const [pID, setPID] = useState('');
  
  useEffect(() => {
    const getUserID = async() => {
        const id = await AsyncStorage.getItem('premiumUserID')
        console.log("ID: ", id); 
        setPID(id);         
    }
    getUserID();
  },[]);

  useEffect(() => {
    fetch(`http://192.168.1.6:8080/sent-Invites`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'premiumUserID': parseInt(pID),
      })
    })
    .then(response => response.json())
      .then(data => {
        setDisplayInvites(data.result);
      })
      .catch(error => {
        console.error('Error posting data to Express backend:', error);
      })
  }, [pID]);

  const handleSubmit = async () => {
    console.log('Search:', search);
    if (search.trim() === '') {
      setSearchResults([]);
      setShowResults(true);
      return;
    }
    try {
      const response = await fetch(`http://192.168.1.6:8080/search-Operator?search=${search}`, {
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
            const filteredResults = data.filter(item => {
                return !displayInvites.some(invite => invite.operatorID === item.operatorID);
            });
        setSearchResults(filteredResults);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const sendInvite = async(operatorID) => {
    fetch(`http://192.168.1.6:8080/send-Invite`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'premiumUserID': parseInt(pID),
          'operatorID': operatorID,
        }),
    })
    .then(response => response.json())
          .then(data => {
            console.log('Response from Express backend:', data);
            if(data.status == 1) {
              console.log('Error sending invte');
            } else if(data.status == 2) {
              console.log('Sent Successfully');
            } else if(data.status == 3) {
              console.log('Invite already sent');
            }
          })
          .catch(error => {
            console.error('Error posting data to Express backend:', error);
          });
      setClickedButtons(prevState => ({
        ...prevState,
        [operatorID]: true
      }));
  };
  
  const renderSearch = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
      <Text style={styles.name}>{item.firstName} {item.lastName} </Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <TouchableOpacity style={styles.inviteBtn} onPress={() => sendInvite(item.operatorID)} >
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
        <Text style={item.status === 'Pending' ? styles.pending : styles.accepted}>{item.status}</Text>
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
          <Text style={styles.btnTxt}>Clear</Text>
        </TouchableOpacity>
        </>
      ) : (
        <>
        <Text style={styles.sentLabel}>Sent Invites</Text>
        <FlatList
          data={displayInvites}
          renderItem={renderInvite}
          keyExtractor={(item, index) => item.operatorID.toString()}
        />
        </>
      )}
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
  fontWeight: 'bold',
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
pending: {
  fontSize: 17,
  color: 'orange',
  fontWeight: 'bold',
  alignSelf: 'center'
},
accepted: {
  fontSize: 17,
  color: 'green',
  fontWeight: 'bold',
  alignSelf: 'center'
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
}
});
