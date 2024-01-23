import './LandingPage.css'
import { LandingPageCard } from '../LandingPageCard/LandingPageCard';
import highFive from '../../../../images/high-five.png'
import bballCourt from '../../../../images/bball-court.png'
import basketballPlayers from '../../../../images/basketball-players.jpg'
import { useSelector } from 'react-redux';

function LandingPage() {
    const user = useSelector(state => state.session.user)
    const isLoggedIn = user ? true : false
    const cardDisabler = isLoggedIn ? '' : 'disabled'

    return (
        <div className="landing-page-content">
            <div className="landing-page-intro-section">
                <h1>The Basketball Platform - Where pick-up gets planned</h1>
                <p>Whatever your skill-level, from semi-pro to average joe, there are thousands* of people finding games and players on Ballr. Events are happening every day. Sign up to join the fun!</p>
            </div>
            <div className="landing-page-intro-img-container">
                <img className="landing-page-intro-img" src="https://thumbs.dreamstime.com/z/colorful-illustration-basketball-players-colourful-group-123447718.jpg?ct=jpeg" alt="drawing of players playing basketball" />
            </div>

            <div className="landing-page-intro-subtitle-container">
                <h2 id="intro-subtitle">How Ballr Works</h2>
                <p id="intro-subtitle-caption">Sign up now and find groups of people who play pick-up! You&apos;ll also be able to see events hosted by groups!</p>
            </div>

            <div className="landing-page-all-cards-container">
                <LandingPageCard imageUrl={highFive} alt="An image of a high five" path={'/groups'} cardTitle='See all Groups' cardText='Look at all the basketball groups registered on Ballr!' cardDisabler={''} />
                <LandingPageCard imageUrl={bballCourt} alt="An image of a basketball court" path={'/events'} cardTitle='Find an event' cardText='Search for basketball events registered on Ballr!' cardDisabler={''} />
                <LandingPageCard imageUrl={basketballPlayers} alt="An image of two basketball players" path={'/groups/new'} cardTitle='Start a new group' cardText='Register a new group on Ballr!' cardDisabler={cardDisabler} />
            </div>

            <div className='landing-page-join-button-container'>
                <button id='landing-page-join-button'>Join Ballr</button>
            </div>
        </div>

    )
}

export default LandingPage;
