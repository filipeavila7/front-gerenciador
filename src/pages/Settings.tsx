import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../components/utils/GetErrorMessage";
import "../styles/settings.css";


function Settings() {

    const navigate = useNavigate();
    const { logout } = useAuth();
    const { showToast } = useToast();
    const [loggingOut, setLoggingOut] = useState(false);


    async function handleLogout() {

        setLoggingOut(true);

        try {

            await logout();

            showToast("success", "Logout realizado com sucesso.");

            navigate(
                "/",
                { replace: true }
            );

        } catch (error) {

            showToast("error", getErrorMessage(error));

            navigate(
                "/",
                { replace: true }
            );

        } finally {

            setLoggingOut(false);

        }

    }


    return (
        <section className="page-lay">
            <header  className="page-header">
                <div className="page-title-box">
                    <h1>
                        
                        Configurações
                    </h1>
                    <p>Gerencie sua sessao e preferencias da conta.</p>
                </div>
            </header>

            <div className="settings-section">
                <div className="settings-section-info">
                    <h2>Sessao</h2>
                    <p>Encerre o acesso neste navegador e remova o refresh token salvo na API.</p>
                </div>

                <button
                    className="settings-logout-btn"
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                >
                    <FiLogOut />
                    {loggingOut ? "Saindo..." : "Sair da conta"}
                </button>
            </div>
        </section>
    );

}


export default Settings;
