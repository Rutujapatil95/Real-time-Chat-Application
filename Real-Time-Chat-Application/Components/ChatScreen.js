import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Replace this with your actual IP every time it changes
const BASE_URL = 'http://192.168.1.15:5000';
const socket = io(BASE_URL);

export default function ChatScreen({ route }) {
  const [username, setUsername] = useState(''); // Will update from route or AsyncStorage
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef();

  
  useEffect(() => {
    const loadUsername = async () => {
      const routeUsername = route?.params?.username;
      if (routeUsername) {
        setUsername(routeUsername);
        await AsyncStorage.setItem('username', routeUsername);
      } else {
        const savedUsername = await AsyncStorage.getItem('username');
        if (savedUsername) setUsername(savedUsername);
      }
    };
    loadUsername();
  }, [route]);

  // ✅ Fetch messages and listen for real-time updates
  useEffect(() => {
    axios.get(`${BASE_URL}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Failed to load messages:", err));

    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => socket.off('receive_message');
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('send_message', {
        username,
        text: input,
      });
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.messages}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => {
          const isSender = msg.username === username;
          return (
            <View
              key={index}
              style={[
                styles.messageContainer,
                isSender ? styles.senderContainer : styles.receiverContainer,
              ]}
            >
              <Text style={styles.username}>{msg.username}</Text>
              <View
                style={[
                  styles.bubble,
                  isSender ? styles.senderBubble : styles.receiverBubble,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  messages: { flex: 1, padding: 10 },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  senderContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  username: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
  },
  senderBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 0,
  },
  receiverBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#fff',
  },
});
