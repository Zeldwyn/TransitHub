import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal} from 'react-native';
import io from 'socket.io-client';
import config from '../config';

const socket = io(`${config.BASE_URL}`);

export default function MessageOperator() {
    const [pID, setPID] = useState('');
    const [userType, setUserType] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentName, setCurrentName] = useState('');
    const [currentOperator, setCurrentOperator] = useState('');
    const [currentOwner, setCurrentOwner] = useState('');
    const [currentConversation, setCurrentConversation] = useState('');
    const [displayOwners, setDisplayOwners] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatModal, setChatModal] = useState(false);
    
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

    const getMessage = () => {
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
                console.log('current convo:',currentConversation)
                setMessages(data.results);
            //   console.log(data.results)
            })
            .catch(error => {
              console.error('Error fetching existing messages:', error);
        });
    };
    const handleConvo = (firstName, lastName, ownerID) => {
        fetch(`${config.BASE_URL}/get-ConversationIDOP`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'premiumUserID': parseInt(pID),
            'ownerID': ownerID
          })
        })
        .then(response => response.json())
          .then(data => {      
            setCurrentConversation(data.conversationID);
            setCurrentOwner(data.ownerID); 
            setCurrentOperator(data.operatorID);
            setCurrentName(firstName + ' ' + lastName);
            console.log('current owner:', ownerID)
            console.log('current operator:', currentOperator)
            socket.emit('join_conversation', { conversationID: data.conversationID });
            setChatModal(true); 
          })
          .catch(error => {
            console.error('Error fetching conversation ID:', error);
          });
    };
    useEffect(() => {
        if (pID) {
          fetch(`${config.BASE_URL}/list-Owner?premiumUserID=${parseInt(pID)}`, {
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
            setDisplayOwners(data);
          })
          .catch(error => {
            console.error('Error fetching data from Express backend:', error);
          });
        }
    }, [pID]);

    useEffect(() => {
        if (currentConversation) {
            getMessage();
        }
    }, [currentConversation]);
    
    

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
        // Emit the message to the server
        socket.emit('send_message', message);
        // Clear the newMessage field
        setNewMessage('');
    };
    

    const renderMessages = ({ item }) => {
        if (userType === item.userType) {
            return (
                <View style={styles.sender}>
                    <Text style={{ fontSize: 16, color: "#fff", }}> {item.text}</Text>
                    <View style={styles.rightArrow}></View>
                    <View style={styles.rightArrowOverlap}></View>
                </View>
            );
        } else {
            return (
                <View style={styles.receiver}>
                    <Text style={{ fontSize: 16, color: "#000", justifyContent: "center" }}> {item.text}</Text>
                    <View style={styles.leftArrow}></View>
                    <View style={styles.leftArrowOverlap}></View>
                </View>
            );
        }
    };
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={() => handleConvo(item.firstName, item.lastName, item.ownerID)}>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.message}>View Conversation</Text>
          </View>
        </TouchableOpacity>
      );

    return (
        <View style={styles.chatModal}>
            <FlatList
                data={displayOwners}
                renderItem={renderItem}
                keyExtractor={(item) => item.ownerID.toString()}
            />
            <Modal animationType='slide' visible={chatModal} onRequestClose={() => {setChatModal(false)}} style={{height: "auto"}}>
                <View style={styles.chatModal}>
                    <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'maroon', height: 60}}>
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
},
sender: {
    backgroundColor: "maroon",
    padding: 10,
    marginLeft: '45%',
    borderRadius: 5,
    marginTop: 5,
    marginRight: "5%",
    maxWidth: '50%',
    alignSelf: 'flex-end',
    borderRadius: 20,
},
receiver: {
    backgroundColor: "#dedede",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginLeft: "5%",
    maxWidth: '50%',
    alignSelf: 'flex-start',
    borderRadius: 20,
},
rightArrow: {
    position: "absolute",
    backgroundColor: "maroon",
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
    backgroundColor: "#dedede",
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
