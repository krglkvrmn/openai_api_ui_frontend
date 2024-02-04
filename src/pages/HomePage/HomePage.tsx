import { Link } from "react-router-dom";

export function HomePage() {
    return (
        <div>
            <ul>
                <li><Link to="/chat/new" >Chat</Link></li>
            </ul>
        </div>
    );
}