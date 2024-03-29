import { Link } from "react-router-dom";
import "./LandingPageCard.css"

export function LandingPageCard({ imageUrl, alt, path, cardTitle, cardText, isCardDisabled }) {
    // const linkDisabler = disabledStyle ? (e) >
    const cardTitleClass = `landing-page-card-title ${isCardDisabled}`
    const cardTextClass = `landing-page-card-text ${isCardDisabled}`
    const cardLinkClass = `landing-page-card-link ${isCardDisabled}`
    return (
        <div className="landing-page-card-container">
            <div className="landing-page-card">
                <Link to={path} className={cardLinkClass}>
                    <div className="landing-page-img-container">
                        <img className="landing-page-card-img" src={imageUrl} alt={alt} />
                    </div>
                    <h3 className={cardTitleClass}>{cardTitle}</h3>
                    <p className={cardTextClass}>{cardText}</p>
                </Link>
            </div>
        </div>
    )
}

export default LandingPageCard;
