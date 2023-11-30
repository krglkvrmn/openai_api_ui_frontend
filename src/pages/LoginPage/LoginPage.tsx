export default function LoginPage() {
    return (
        <div>
            <form>
                <label htmlFor="login-email-input">Email:</label>
                <input id="login-email-input" type="email" placeholder="Enter your email" />
                <br/>
                <label htmlFor="login-password-input">Password:</label>
                <input id="login-password-input" type="password" placeholder="Enter your password" />
                <br />
                <button type="submit">Log In</button>
            </form>
        </div>
    );
}