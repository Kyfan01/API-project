import { Link } from "react-router-dom";
import "./LandingPageCard.css"

export function LandingPageCard({ imageUrl, alt, path, cardTitle, cardText }) {
    return (
        <div className="landing-page-card-container">
            <Link to={path} >
                <div className="landing-page-img-container">
                    <img className="landing-page-card-img" src={imageUrl} alt={alt} />
                </div>
                <h3 className="landing-page-card-title">{cardTitle}</h3>
                <p className="landing-page-card-text">{cardText}</p>
            </Link>
        </div>
    )
}

export default LandingPageCard;
