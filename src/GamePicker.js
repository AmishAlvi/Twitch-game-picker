import React, { Component } from 'react'
import { Table } from 'react-bootstrap'
import {Spinner} from 'react-bootstrap'
const clientId = process.env.REACT_APP_CLIENT_ID;

class GamePicker extends Component{
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,    // to track fetching and laoding games
            isSubmitted: false, // to track average view submittion
            isCalculated: false, // to track final calculation completion
            average_viewers: '', // to store user average view count
            queries: 0 // track number of games currently being queried
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //gaining access to props passed from Gameloader.js
    access_info = this.props.access_info // gains access to OAuth token and client secret
    games = this.props.validgames // gains access to validated list of live games 
    ten_game = [] // array to keep track of games use will be top ten in

    //sets average viewers to user submitted value
    handleChange(event) {
        this.setState({
            average_viewers: event.target.value,
        });
    }

    /* after the user submits their average viewer count
    ** this code block fetches the top ten streams for all the validated games
    ** Then compares the viewer range to the average value submitted
    ** for games in which the average value is greater than the tenth stream's value
    ** the viewer will appear in teh top and this the game is added to the ten_game array to be shown to user
    */
    async handleSubmit(event) {
        this.setState({
            isLoaded: true
        });
        event.preventDefault(); // prevent page from reloading on form submission
        var games_url = new URL('https://api.twitch.tv/helix/streams/')
        // this.games.length
        for(var m = 0; m < this.games.length; m++) // iterating over each valid game using "m" to fetch data for individual games
        {
            //console.log(this.games[m].id)

            this.setState({
                queries: (this.games.length - m) // tracking the number of games queried to be shopwn to user
            })

            // this next code block defines params and fetches the top ten streams for the current game "m"
            var params = {game_id: this.games[m].id, first: 20}
            games_url.search = new URLSearchParams(params).toString();
            await fetch(games_url, {
    
                method: 'GET',
                headers: {
                    Accept: 'application/vnd.twitchtv.v5+json',
                    Authorization: `Bearer ${this.access_info.access_token}`,
                    'Client-ID': clientId
                }
            })
            .then(res => res.json())
            //after fetching the top ten streams this code block compares the view count of the 10th stream to the users average view count
            .then(json => {
                //console.log(json)
                if(Number(json.data.length > 19))
                {
                    if(this.state.average_viewers > Number(json.data[9].viewer_count)) 
                    {
                        
                        this.ten_game.push(this.games[m])
                    }
                }
            }).catch((err) => {
                console.log(err);
            })
            
        }

        console.log(this.ten_game)
        
        // confirming that the final list has been calculated and can now be renderd
        this.setState({
            isCalculated: true
        });
    

    }
    
    
    render() {
        const{isLoaded, isCalculated, queries} = this.state; // getting access to states

        // checks if user input has been loaded, and renders a form for input if not
        if(!isLoaded)
        {
            return(
                <form onSubmit={this.handleSubmit}>
                    <label><h3>Please enter your average view count:
                    <input type="number" value={this.state.average_viewers} onChange={this.handleChange} />
                    </h3></label>
                    <input type="submit" value="Submit" />
                </form>
            )
        }
        
        //checks if final list of games has been calculated and renders a progress bar of games being quesried currently if not
        if(!isCalculated)
        {
            return(
                <div className="center">
                    <h3>Please wait while we query over {queries} games</h3>
                    <Spinner animation="border"  variant="light"/>
                </div>

            )
        }
            // renders table with final list of games
            return (
                <div>
                    <h4>With an average viewership of {this.state.average_viewers} you will appear in the top ten in these categories</h4>
                    <Table bordered variant="dark" size="sm">
                        <tbody>
                        <tr>
                            <td><h3>Box</h3></td>
                            <td><h3>Game</h3></td>
                            {/* <td><h3>Total Viewers</h3></td>
                            <td><h3>Total Channels</h3></td> */}
                        </tr>
                    {this.ten_game.map(value => { //mapping values from the final games list and rendering them one by one in the table
                        return(
                                
                                <tr>   
                                    <td><a href={'https://twitch.tv/directory/game/' + value.name} target='_blank'><img src={value.box_art_url.split('-{')[0]+'-138x190.jpg'} /></a></td>
                                    <td><a href={'https://twitch.tv/directory/game/' + value.name} target='_blank'>{value.name}</a></td>
                                    {/* <td>{value.viewers}</td>
                                    <td>{value.channels}</td> */}
                                </tr>
                            
                        )
                    })}
                    </tbody>
                    </Table>
                </div>
            )
        
    }
}

export default GamePicker