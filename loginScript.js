let loginAttempts = 0;
let lockoutEndTime = 0;
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 10000; 

const BACKEND_URL = window.BACKEND_API_URL || 'https://corporate-marketa-odvin123-2e265ec9.koyeb.app'

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('loginError');
    const loginButton = document.getElementById('loginButton');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';

    const currentTime = Date.now();
    if (currentTime < lockoutEndTime) {
        const remainingSeconds = Math.ceil((lockoutEndTime - currentTime) / 1000);
        errorDiv.textContent = `Demasiados intentos fallidos. Intenta de nuevo en ${remainingSeconds} segundos.`;
        errorDiv.style.display = 'block';

        loginButton.disabled = true;
        setTimeout(() => {
            loginButton.disabled = false;
        }, lockoutEndTime - currentTime);
        return;
    }

    if (!email || !password) {
        errorDiv.textContent = 'Por favor, completa ambos campos.';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/login`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: email, contraseña: password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            errorDiv.textContent = errorData.error || 'Credenciales incorrectas';
            errorDiv.style.display = 'block';
            console.error('Error de login:', errorData.error);

            loginAttempts++;
            if (loginAttempts >= MAX_ATTEMPTS) {
                lockoutEndTime = currentTime + LOCKOUT_DURATION;
                const remainingSeconds = Math.ceil(LOCKOUT_DURATION / 1000);
                errorDiv.textContent = `Demasiados intentos fallidos. Has sido bloqueado por ${remainingSeconds} segundos.`;
                loginButton.disabled = true;
                setTimeout(() => {
                    loginButton.disabled = false;
                }, LOCKOUT_DURATION);
            }
            return;
        }

       
        const result = await response.json();

        if (result.usuario && result.usuario.rol === 'admin') {
            localStorage.setItem('isLoggedIn', 'true');
            console.log('Login exitoso. Redirigiendo a /dashboard.html');
            window.location.href = '/dashboard.html'; 
            loginAttempts = 0;
            lockoutEndTime = 0;
        } else {
            errorDiv.textContent = 'Solo los administradores pueden acceder.';
            errorDiv.style.display = 'block';
        }

    } catch (error) {
        console.error('❌ Error en la solicitud de login:', error);
        errorDiv.textContent = 'Hubo un problema de conexión al iniciar sesión. Inténtalo de nuevo.';
        errorDiv.style.display = 'block';

        loginAttempts++;
        if (loginAttempts >= MAX_ATTEMPTS) {
            lockoutEndTime = currentTime + LOCKOUT_DURATION;
            const remainingSeconds = Math.ceil(LOCKOUT_DURATION / 1000);
            errorDiv.textContent = `Demasiados intentos fallidos o problemas de conexión. Has sido bloqueado por ${remainingSeconds} segundos.`;
            loginButton.disabled = true;
            setTimeout(() => {
                loginButton.disabled = false;
            }, LOCKOUT_DURATION);
        }
    }
});
