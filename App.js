/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
  ActivityIndicator,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';

import {
  GoogleSignin,
  GoogleSigninButton,
  NativeModuleError,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import {SelectList} from 'react-native-dropdown-select-list';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [title, onChangeTitle] = React.useState();
  const [description, onChangeDesc] = React.useState();
  const [privacy, onChangePrivacy] = React.useState('public');

  const privacyList = [
    {key: '1', value: 'public'},
    {key: '2', value: 'unlisted'},
    {key: '3', value: 'private'},
  ];

  const webClientId =
    'GCM WEB CLIENT ID';
  const iosClientId =
    'IOS CLIENT ID';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const KEY_API = 'APP API KEY';
  const [authToken, setAuthToken] = useState();
  const [isLoading, setLoading] = useState(true);
  const [liveBroadcast, setLiveBroadcast] = useState([]);

  GoogleSignin.configure({
    scopes: [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ], // what API you want to access on behalf of the user, default is email and profile
    webClientId: webClientId,
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    hostedDomain: '', // specifies a hosted domain restriction
    forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
    accountName: '', // [Android] specifies an account name on the device that should be used
    iosClientId: iosClientId, // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
    openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
    profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
  });

  const _signIn = async () => {
    try {
      //ML 1: Google OAuth 2
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('User Info ::', userInfo);
      const {accessToken} = await GoogleSignin.getTokens();
      console.log('accessToken ::', accessToken);
      setAuthToken(accessToken);

      //ML 2: Live Broadcast Schedules List Request

      getLiveBroadcastSchedules(accessToken);

      //ML 3: - [ ] Create a newly scheduled event for YouTube streaming
    } catch (error) {
      console.log('ERROR ::', error);
    }
  };

  const getLiveBroadcastSchedules = async accessToken => {
    try {
      const response = await fetch(
        'https://youtube.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,contentDetails,status&mine=true&broadcastType=all&key=' +
          KEY_API,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const json = await response.json();
      console.log('JSON DATA', JSON.stringify(json));
      setLiveBroadcast(json.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const posteBroadcastSchedules = async () => {
    try {
      const response = await fetch(
        'https://youtube.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,contentDetails,status&mine=true&broadcastType=all&key=' +
          KEY_API,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      const json = await response.json();
      console.log('JSON DATA', JSON.stringify(json));
      //setLiveBroadcast(json.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              padding: 15,
            }}>
            <GoogleSigninButton
              style={{width: 192, height: 48, alignSelf: 'center'}}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={_signIn}
            />

            {!authToken && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#485a96',
                  borderWidth: 0.5,
                  borderColor: '#fff',
                  height: 40,
                  width: 180,
                  borderRadius: 4,
                  margin: 5,
                }}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.5}>
                <Image
                  source={require('./assets/ic_youtube.png')}
                  style={{
                    margin: 5,
                    height: 25,
                    width: 25,
                  }}
                />
                <View style={{backgroundColor: '#fff', width: 1, height: 40}} />
                <Text
                  style={{
                    alignSelf: 'center',
                    color: '#fff',
                    marginLeft: 10,
                    fontWeight: '600',
                  }}>
                  Create Streams
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {isLoading && authToken?.length > 0 ? (
            <ActivityIndicator />
          ) : (
            <View style={{flex: 1, marginTop: 20}}>
              {liveBroadcast?.length > 0 && (
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Image
                    style={{
                      width: 30,
                      height: 30,
                      marginRight: 10,
                    }}
                    source={require('./assets/ic_youtube.png')}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '800',
                      alignSelf: 'center',
                    }}>
                    Upcoming Youtube streams
                  </Text>
                </View>
              )}
              <FlatList
                style={{marginTop: 30}}
                data={liveBroadcast}
                ListEmptyComponent={() => {
                  return authToken?.length > 0 &&
                    liveBroadcast?.length === 0 ? (
                    <View
                      style={{
                        backgroundColor: 'red',
                        justifyContent: 'center',
                        margin: 20,
                        height: 150,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Cochin',
                          fontWeight: '500',
                          alignSelf: 'center',
                          color: 'white',
                          fontSize: 22,
                        }}
                        numberOfLines={2}>
                        {'The user is not enabled for live streaming'}
                      </Text>
                    </View>
                  ) : null;
                }}
                keyExtractor={({id}, index) => id}
                renderItem={({item}) => (
                  <View
                    style={{
                      paddingVertical: 5,
                      marginHorizontal: 10,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                    }}>
                    <Image
                      style={{
                        width: 50,
                        height: 50,
                        marginRight: 10,
                        borderWidth: 1,
                        borderColor: 'red',
                      }}
                      source={{uri: item?.snippet?.thumbnails?.default?.url}}
                    />
                    <Text
                      style={{
                        fontFamily: 'Cochin',
                        fontWeight: '500',
                        alignSelf: 'center',
                      }}
                      numberOfLines={2}>
                      {item?.snippet?.title}
                    </Text>
                  </View>
                )}
              />
            </View>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Image
                    style={{
                      width: 30,
                      height: 30,
                      marginRight: 10,
                    }}
                    source={require('./assets/ic_youtube.png')}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '800',
                      alignSelf: 'center',
                    }}>
                    Create new stream
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  onChangeText={text => onChangeTitle(text)}
                  value={title}
                  placeholder="Enter Title"
                />

                <TextInput
                  style={styles.input}
                  onChangeText={text => onChangeTitle(text)}
                  value={title}
                  placeholder="Enter Description"
                />

                <SelectList
                  setSelected={val => onChangePrivacy(val)}
                  data={privacyList}
                  save="value"
                  boxStyles={{
                    borderRadius: 90,
                    height: 45,
                    width: 280,
                    marginVertical: 10,
                  }}
                  dropdownStyles={{
                    height: 120,
                  }}
                />
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>Create</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    width: 150,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    width: 280,
  },
});

export default App;
