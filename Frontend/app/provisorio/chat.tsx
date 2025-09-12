import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aqua';
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (input.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    setTimeout(() => {
      const aquaReply: Message = {
        id: (Date.now() + 1).toString(),
        text: `💧✨ Aqua-Chan: Lembre-se de beber água agora!`,
        sender: 'aqua',
      };
      setMessages(prev => [...prev, aquaReply]);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 800);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.sender === 'user'
                  ? { justifyContent: 'flex-end' }
                  : { justifyContent: 'flex-start' },
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  item.sender === 'user'
                    ? styles.userBubble
                    : styles.aquaBubble,
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '75%',
  },
  userBubble: {
    backgroundColor: '#B2EBF2',
  },
  aquaBubble: {
    backgroundColor: '#80DEEA',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#B2DFDB',
    backgroundColor: '#E0F7FA',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
    height: 45,
  },
  sendButton: {
    backgroundColor: '#00BCD4',
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
