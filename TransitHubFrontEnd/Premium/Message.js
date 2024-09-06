import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import io from 'socket.io-client';
import config from '../config';

const socket = io('http://192.168.1.5:8080');

export default function Message() {
  const [pID, setPID] = useState('');
  const [userType, setUserType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayOperators, setDisplayOperators] = useState([]);
  const [allOperators, setAllOperators] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatModal, setChatModal] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [currentOperator, setCurrentOperator] = useState('');
  const [currentOwner, setCurrentOwner] = useState('');
  const [currentConversation, setCurrentConversation] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const getUserID = async () => {
      const id = await AsyncStorage.getItem('premiumUserID');
      const type = await AsyncStorage.getItem('userType');
      console.log("ID: ", id);
      console.log("UserType in Message: ", type);
      setUserType(type);
      setPID(id);
    };
    getUserID();
  }, []);

  useEffect(() => {
    if (pID) {
      fetch(`${config.BASE_URL}/message-Owner`, {
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
          setAllOperators(data.result);
          setDisplayOperators(data.result);
        })
        .catch(error => {
          console.error('Error posting data to Express backend:', error);
        });
    }
  }, [pID, chatModal]);

  useEffect(() => {
      socket.on('message', (message) => {
        if (message.conversationID === currentConversation) {
          setMessages(prevMessages => [...prevMessages, message]);
        }
      });
      return () => {
        socket.off('message');
      };
  }, [currentConversation]);

  useEffect(() => {
    fetch(`${config.BASE_URL}/select-Messages`, {
      method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'conversationID': currentConversation,
        })
    })
      .then(response => response.json())
      .then(data => {
        setMessages(data.results);
        console.log(data.results)
      })
      .catch(error => {
        console.error('Error fetching existing messages:', error);
      });
  }, [currentConversation])

  const handleConvo = (operatorID, ownerID, firstName, lastName) => {
    fetch(`${config.BASE_URL}/get-ConversationID`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'ownerID': ownerID,
        'operatorID': operatorID,
      })
    })
    .then(response => response.json())
      .then(data => {
        setCurrentConversation(data.conversationID);
        socket.emit('join_conversation', { conversationID: data.conversationID });
      });
      setCurrentOwner(ownerID); 
      setCurrentOperator(operatorID);
      setCurrentName(firstName + ' ' + lastName);
      setChatModal(true);
  };

  const sendMessage = () => {
    if (newMessage.trim() === '') {
      return;
    }
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
    const message = {
      conversationID: currentConversation,
      ownerID: currentOwner,
      operatorID: currentOperator,
      userType: userType,
      text: newMessage,
      created_at: formattedDate,
    };
    socket.emit('send_message', message);
    setNewMessage(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleConvo(item.operatorID, item.ownerID, item.firstName, item.lastName)}>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.message}>View Conversation</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessages = ({item,index})=>{
    if (item.conversationID === currentConversation) { 
    if(userType == item.userType) {
      return (
        <View style={styles.sender} key={index}>          
          <Text style={{ fontSize: 18, color: "#000", }}> {item.text}</Text>
            <View style={styles.rightArrow}></View>
            <View style={styles.rightArrowOverlap}></View>         
        </View>
      )
    } else {
      return (
        <View style={styles.receiver} key={index}>
            <Text style={{ fontSize: 18, color: "#fff",justifyContent:"center" }} key={index}> {item.text}</Text>
            <View style={styles.leftArrow}></View>
            <View style={styles.leftArrowOverlap}></View>
        </View>
      )  
    }}
  };
    

  useEffect(() => {
    const filteredOperators = allOperators.filter(operator =>
      operator.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operator.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setDisplayOperators(filteredOperators);
  }, [searchQuery, allOperators]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={displayOperators}
        renderItem={renderItem}
        keyExtractor={(item) => item.operatorID.toString()}
      />
      <Modal animationType='slide' visible={chatModal} onRequestClose={() => {setChatModal(false)}} style={{height: "auto"}}>
        <View style={styles.chatModal}>
          <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'maroon', height: 60, marginTop: 0}}>
            <Text style={{alignSelf: 'center', fontSize: 24, color: 'white', fontWeight: '600'}}>{currentName}</Text>
          </View>
          <FlatList
            data={messages}
            renderItem={renderMessages}
            keyExtractor={(item, index) => index.toString()}
          />
          <View style={styles.searchContainer}> 
          <TextInput
            style={styles.searchInput}
            value={newMessage}
            placeholder="Type your message..." 
            onChangeText={(text) => setNewMessage(text)}
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => sendMessage()}>
            <Text style={styles.searchButtonText}>Send</Text>
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
  justifyContent: 'space-between',
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
searchButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
itemContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
  backgroundColor: '#fff',
  marginVertical: 5,
  marginHorizontal: 10,
  borderRadius: 10,
  elevation: 3,
},
textContainer: {
  flex: 1,
},
name: {
  fontSize: 18,
  fontWeight: 'bold',
},
message: {
  fontSize: 14,
  color: '#666',
},
chatModal: {
  flex: 1,
  height: "100%"
},
sender: {
  backgroundColor: "#dedede",
  padding:15,
  marginLeft: '45%',
  borderRadius: 3,
  marginTop: 5,
  marginRight: "5%",
  maxWidth: '50%',
  alignSelf: 'flex-end',
  borderRadius: 20,
},
receiver: {
  backgroundColor: "maroon",
  padding:15,
  borderRadius: 3,
  marginTop: 5,
  marginLeft: "5%",
  maxWidth: '50%',
  alignSelf: 'flex-start',
  borderRadius: 20,
},
rightArrow: {
  position: "absolute",
  backgroundColor: "#dedede",
  width: 20,
  height: 25,
  bottom: 0,
  borderBottomLeftRadius: 25,
  right: -10
},
rightArrowOverlap: {
  position: "absolute",
  backgroundColor: "#eeeeee",
  width: 20,
  height: 35,
  bottom: -6,
  borderBottomLeftRadius: 18,
  right: -20

},
leftArrow: {
  position: "absolute",
  backgroundColor: "maroon",
  width: 20,
  height: 25,
  bottom: 0,
  borderBottomRightRadius: 25,
  left: -10
},
leftArrowOverlap: {
    position: "absolute",
    backgroundColor: "#eeeeee",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomRightRadius: 18,
    left: -20

},
});
