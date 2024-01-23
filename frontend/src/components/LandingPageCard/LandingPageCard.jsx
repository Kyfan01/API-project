import { Link } from "react-router-dom";
import "./LandingPageCard.css"

export function LandingPageCard({ imageUrl, alt, path, cardTitle, cardText, cardDisabler }) {
    const cardTitleClass = "landing-page-card-title " + cardDisabler
    const cardTextClass = "landing-page-card-text " + cardDisabler
    return (
        <div className="landing-page-card-container">
            <Link to={path} className={cardDisabler}>
                <div className="landing-page-img-container">
                    <img className="landing-page-card-img" src={imageUrl} alt={alt} />
                </div>
                <h3 className={cardTitleClass}>{cardTitle}</h3>
                <p className={cardTextClass}>{cardText}</p>
            </Link>
        </div>
    )
}

export default LandingPageCard;
