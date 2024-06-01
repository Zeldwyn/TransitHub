import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import io from 'socket.io-client';

const socket = io('http://192.168.1.6:8080'); // Replace with your server IP

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
  const navigation = useNavigation();

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
      fetch(`http://192.168.1.6:8080/message-Owner`, {
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
    socket.on('receive_message', (message) => {
      if (message.conversationID === currentConversation) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [currentConversation]);

  const handleConvo = (operatorID, ownerID, firstName, lastName) => {
    fetch(`http://192.168.1.6:8080/get-ConversationID`, {
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
    const message = {
      conversationID: currentConversation,
      ownerID: currentOwner,
      oepratorID: currentOperator,
      text: newMessage,
    };
    socket.emit('send_message', message);
    setNewMessage('');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleConvo(item.operatorID, item.ownerID, item.firstName, item.lastName)}>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.message}>Start a Conversation</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessages = ({ item }) => (
    <View style={styles.textContainer}>
      <Text style={styles.name}>{item.text} {item.created_at}</Text>
    </View>
  );

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
          onChangeText={setSearchQuery}
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
      <Modal animationType='slide' visible={chatModal} onRequestClose={() => {setChatModal(false)}}>
        <View style={styles.chatModal}>
          <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => {setChatModal(false)}} style={{alignSelf: 'flex-start', marginLeft: 10}}>
              <FontAwesome5 name="kiss-wink-heart" size={24} color="black" />
            </TouchableOpacity>
            <Text style={{alignSelf: 'center', fontSize: 20}}>{currentName}</Text>
          </View>
          <FlatList
            data={messages}
            renderItem={renderMessages}
            keyExtractor={(item) => item.messageID.toString()}
          />
          <View style={styles.searchContainer}> 
            <TextInput
              style={styles.searchInput}
              placeholder="Type your message..." 
              value={newMessage}
              onChangeText={(text) => setNewMessage(text)}
            />
            <TouchableOpacity style={styles.searchButton} onPress={sendMessage}>
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
  }
});
