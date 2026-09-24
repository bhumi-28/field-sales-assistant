import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Which URL to use depends on where the app runs:
//   Android emulator (Android Studio)  -> http://10.0.2.2:8081/api   (10.0.2.2 = your laptop)
//   Real phone on the same WiFi        -> http://<your laptop IP>:8081/api  (e.g. 192.168.1.7)
const BASE_URL = 'http://10.0.2.2:8081/api';

const axiosClient = axios.create({ baseURL: BASE_URL, timeout: 15000 });

axiosClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'userName', 'userRole']);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;