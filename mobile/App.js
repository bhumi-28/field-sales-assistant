import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import CustomerDetailsScreen from './src/screens/CustomerDetailsScreen';
import LogVisitScreen from './src/screens/LogVisitScreen';
import TasksScreen from './src/screens/TasksScreen';
import AiAssistantScreen from './src/screens/AiAssistantScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Customers" component={CustomersScreen} />
        <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
        <Stack.Screen name="LogVisit" component={LogVisitScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen name="AiAssistant" component={AiAssistantScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}