import { Link } from "react-router-dom";
import tempLogo from '../../../../images/temp-logo.png'

function LogoButton() {
    //console.log('logo rendered')

    return (
        <>
            <Link to='/'>
                <img id="navlogo" src={tempLogo} alt="ballr logo" />
            </Link>
        </>
    )
}


export default LogoButton;
