import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import ProductInfo from '../screens/ProductInfo';
import DTScreeen from '../screens/DTScreeen';
import TBScreen from '../screens/TBScreen';
import LTScreen from '../screens/LTScreen';
import PKScreen from '../screens/PKScreen';
import SWScreen from '../screens/SWScreen';
import TVScreen from '../screens/TVScreen';
import CartScreen from '../screens/CartScreen';
import AddressScreen from '../screens/AddressScreen';
import OrderScreen from '../screens/OrderScreen';
import * as Linking from 'expo-linking';
import VerifyScreen from '../screens/VerifyScreen';
import PlaceOrderScreen from '../screens/PlaceOrderScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReviewScreen from '../screens/ReviewScreen';
import InfoScreen from '../screens/InfoScreen';
import QuenMKScreen from '../screens/QuenMKScreen';
import CSKH from '../screens/CSKH';




const StackNavigator = () => {

    const Stack = createNativeStackNavigator();
    const Tab = createBottomTabNavigator();
    function BottomTabs() {
        return (
            <Tab.Navigator>
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarLabel: "Home",
                        tabBarLabelStyle: { color: "#008E97" },
                        headerShown: false,
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <Entypo name="home" size={24} color="#008E97" />
                            ) : (
                                <AntDesign name="home" size={24} color="#008E97" />
                            )
                    }}
                />

                <Tab.Screen
                    name="Cart"
                    component={CartScreen}
                    options={{
                        tabBarLabel: "Cart",
                        tabBarLabelStyle: { color: "#008E97" },
                        headerShown: false,
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <Ionicons name="cart" size={24} color="#008E97" />
                            ) : (
                                <Ionicons name="cart-outline" size={24} color="#008E97" />
                            )
                    }}
                />

                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarLabel: "Profile",
                        tabBarLabelStyle: { color: "#008E97" },
                        headerShown: false,
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <Ionicons name="person" size={24} color="#008E97" />
                            ) : (
                                <Ionicons name="person-outline" size={24} color="#008E97" />
                            )
                    }}
                />
            </Tab.Navigator>
        )
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
                <Stack.Screen name="Info" component={ProductInfo} options={{ headerShown: false }} />
                <Stack.Screen name="DT" component={DTScreeen} options={{ headerShown: false }} />
                <Stack.Screen name="TB" component={TBScreen} options={{ headerShown: false }} />
                <Stack.Screen name="LT" component={LTScreen} options={{ headerShown: false }} />
                <Stack.Screen name="PK" component={PKScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SW" component={SWScreen} options={{ headerShown: false }} />
                <Stack.Screen name="TV" component={TVScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Address" component={AddressScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Order" component={OrderScreen} options={{ headerShown: false }} />
                <Stack.Screen name="verify" component={VerifyScreen} options={{ headerShown: false }} />
                <Stack.Screen name="place" component={PlaceOrderScreen} options={{ headerShown: false }} />
                <Stack.Screen name="review" component={ReviewScreen} options={{ headerShown: false }} />
                <Stack.Screen name="info" component={InfoScreen} options={{ headerShown: false }} />
                <Stack.Screen name="QuenMK" component={QuenMKScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CSKH" component={CSKH} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default StackNavigator

const styles = StyleSheet.create({})