import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import GamePicker from './GamePicker'
import {Spinner} from 'react-bootstrap'
import { Button } from 'react-bootstrap'

// defining twitch client secret and id for fetch requests
const clientId = process.env.REACT_APP_CLIENT_ID;
const clientSecret = process.env.REACT_APP_CLIENT_SECRET;


//initial laoding component for fetching and validating games on initial load
class Gameloader extends Component {

      /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props) {

      super(props);

      this.state = {
          access_info: [],
          isLoaded: false,
          games: [],
          loadedGames: 1100
      }

     

    }


  games_array = []  // array of validated games (i.e games over 20 streamers in em)
  
  async componentDidMount() {

    // fetching OAuth token from twitch and assigning to reusable state
    await fetch('https://id.twitch.tv/oauth2/token?client_id=' + clientId  + '&client_secret=' + clientSecret +'&grant_type=client_credentials', {
        method: 'post',
        //mode: 'no-cors',
        })
        .then(res => res.json())
        .then(json => {
            this.setState({
                access_info: json,
                
            })
        }).catch((err) => {
            console.log(err);
        });
    
    
    /* this next block fetches the top 1000 games on twitch 100 at a time 
    ** once games are fetched if checks if there are more than 20 streamers in the category
    ** this is to verify that the category is not dead
    ** Once verified the games that meet the requirements are added into 
    ** games_array
    */
    var url = new URL('https://api.twitch.tv/kraken/games/top')
    for(var i = 0; i < 1100; i += 100)
    {
        var params = {offset: i, limit: 100}
        url.search = new URLSearchParams(params).toString();
        await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/vnd.twitchtv.v5+json',
                Authorization: 'Bearer {this.access_info.access_token}',
                'Client-ID': clientId
            }
        })
        .then(res => res.json())
        .then(json => {
           
                for(var k = 0; k < json.top.length; k++)
                {
                    if(Number(json.top[k].channels) > 20)
                    {
                        this.setState({
                            loadedGames: 1100 - i
                        })

                        this.games_array.push(json.top[k])
                        //console.log(this.games_array[k].game.name)
                        
                    }
                }

                
            
            
        }).catch((err) => {
            console.log(err);
        });
    }


    //set loaded state to tell app that games have succesfully laoded and the app can now render
    this.setState({
        isLoaded: true, 
        games: this.games_array
    })

    //console.log(this.games_array)
    
  }

    // twitch and donate buttons on home page
    btnClickDonate() {
        window.open("https://streamelements.com/twinkietalks/tip");
    }   
    btnClickTwitch() {
        window.open("https://twitch.tv/twinkietalks");
    } 

  render() {

    // getting access to states
    const { isLoaded,  games, access_info, loadedGames} = this.state;
    
    // defining props to be passed on to Gamepicker component
    let props = {
        validgames: games,
        access_info: access_info
    }

    // checks to see if games list has been loaded, if it hasnt loaded, show use an initial loading screen
    if (!isLoaded)
        return <div className="center"><h3>Please wait while we load the top {loadedGames} games from twitch</h3><Spinner animation="border"  variant="light"/></div>;

    // Creating home page and launching game pciker component
    return(
        <div className="component">
            <label><h1>Twitch Game Picker</h1>
            <p>By Twinkietalks</p></label>
            <p>How It Works:</p>
            <ul>
                <li>
                We first get all categories from twitch and select the ones that have more than 20 streamers live right now (i.e not a dead category)
                </li>    
                <li>
                Then using your average we calculate if you'll be in the top ten streamers in these categories
                </li>
            </ul>

            <p> You can use this info to get get a good position and grow! <span role="img">😄</span> </p>
            <p>If you find this application helpful consider <Button variant="info"  onClick={this.btnClickDonate.bind(this)}>Donating</Button> and Follow me on <Button onClick={this.btnClickTwitch.bind(this)}> Twitch </Button> </p>
            <GamePicker {...props} />    
        </div>
    )
  }
}
export default Gameloader;

