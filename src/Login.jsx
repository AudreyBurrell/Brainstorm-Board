//css import here
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {

    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if(data.success) {
                localStorage.setItem('userId', username);
                navigate('/');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Server error. Please try again.');
            console.error(err);
        }
    }
    const handleCreateAccount = () => {
        navigate('/CreateAccount');
    }

    return (
        <div className="loginCard">
           <p>Login to Brainstorm Board</p>
           <div className="formArea">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
           </div>
           <button className="loginBtn" onClick={handleLogin}>Login</button>
           <button className="createAccountBtn" onClick={handleCreateAccount}>Create Account</button>
        </div>
    )
}

export default Login;