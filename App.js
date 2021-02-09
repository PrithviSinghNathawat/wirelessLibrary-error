
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import SearchScreen from './screens/SearchScreen';
import TransactionScreen from './screens/TransactionScreen';
import {createAppContainer} from 'react-navigation';
import { createBottomTabNavigator} from 'react-navigation-tabs';

export default class App extends React.Component {
  
  render(){
  return (
    <AppContainer/>
  )
  }
}

const TabNavigator = createBottomTabNavigator(
  {
  transaction:{screen:TransactionScreen},
  search:{screen:SearchScreen}
  },
  {
    defaultNavigationOptions:({navigation})=>({
      tabBarIcon:()=>{
        const routeName= navigation.state.routeName
        if(routeName==='transaction'){
          return(
            <Image source={require("./assets/Capture.png")}
            style={{width:50,height:50}}
            />
          )
        }

        else if(routeName==='search'){
          return(
            <Image source={require("./assets/search.png")}
            style={{width:50,height:50}}
            />
          )
        }
      }
    })
  }
  );

const AppContainer = createAppContainer(TabNavigator)
