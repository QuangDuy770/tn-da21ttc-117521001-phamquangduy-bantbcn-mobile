import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OverviewScreen from '../Screens/OverviewScreen';
import AddScreen from '../Screens/AddScreen';
import ListScreen from '../Screens/ListScreen';
import OrderScreen from '../Screens/OrderScreen';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Review from '../Screens/Review';

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          tabBarLabel: "Overview",
          tabBarLabelStyle: { color: "#008E97" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="home" size={24} color="#008E97" />
            ) : (
              <AntDesign name="home" size={24} color="#008E97" />
            ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{
          tabBarLabel: "Add",
          tabBarLabelStyle: { color: "#008E97" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="plus" size={24} color="#008E97" />
            ) : (
              <AntDesign name="plus" size={24} color="#008E97" />
            ),
        }}
      />
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{
          tabBarLabel: "List",
          tabBarLabelStyle: { color: "#008E97" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="list" size={24} color="#008E97" />
            ) : (
              <Ionicons name="list-outline" size={24} color="#008E97" />
            ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderScreen}
        options={{
          tabBarLabel: "Orders",
          tabBarLabelStyle: { color: "#008E97" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="basket" size={24} color="#008E97" />
            ) : (
              <Ionicons name="basket-outline" size={24} color="#008E97" />
            ),
        }}
      />
      <Tab.Screen
        name="Review"
        component={Review}
        options={{
          tabBarLabel: "Review",
          tabBarLabelStyle: { color: "#008E97" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="star" size={24} color="#008E97" />
            ) : (
              <Ionicons name="star-outline" size={24} color="#008E97" />
            ),
        }}
      />

    </Tab.Navigator>
  );
}

export default BottomTabs;
