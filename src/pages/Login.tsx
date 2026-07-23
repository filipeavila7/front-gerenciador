import { useState } from "react";
import api from "../service/api";

import type { LoginRequest } from "../types/auth/LoginRequest";
import type { LoginResponse } from "../types/auth/LoginResponse";
import { FaRegUser, FaGithub, FaStar, FaGoogle, FaDiscord } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import "../styles/login.css";
import { LuLock } from "react-icons/lu";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../components/utils/GetErrorMessage";


function Login() {

    const navigate = useNavigate();
    const {
        authenticated,
        loading,
        login
    } = useAuth();

    const [form, setForm] = useState<LoginRequest>({
        email: "",
        password: ""
    });

    const [errorMsg, setErrorMsg] = useState("");


    function handleChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {

        const { name, value } = event.target;


        setForm({
            ...form,
            [name]: value
        });

    }


    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMsg("");

        try {
            const response = await api.post<LoginResponse>(
                "/auth/login",
                form
            );

            await login(
                response.data.accessToken,
                response.data.refreshToken
            );

            console.log("Depois do login");


            const pendingInvite = sessionStorage.getItem("pendingInvite");
            
            console.log("Pending:", pendingInvite);

            

            
            navigate("/families");


        } catch (error) {
            setErrorMsg(getErrorMessage(error));
        }
    }


    if (loading) {
        return <p>Carregando...</p>;
    }


    if (authenticated) {
    const pendingInvite = sessionStorage.getItem("pendingInvite");
    console.log("entrou no bloco do autenticated")
    return (
        <Navigate
            to={pendingInvite ? `/invite/${pendingInvite}` : "/families"}
            replace
        />
    );
}


    return (
        <main className="form-lay">

            <div className="form-box">
                <div className="form-title">
                    <h2>Log<span className="color1">in</span> </h2>
                </div>

                <form className="form" onSubmit={handleSubmit}>

                    <label htmlFor="email">Email</label>

                    <div className="input-lay">
                        <FaRegUser className="login-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <label htmlFor="">Senha</label>

                    <div className="input-lay">
                        <LuLock className="login-icon" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Senha"
                            value={form.password}
                            onChange={handleChange}
                            required

                        />
                    </div>



                    <button className="btn-login" type="submit">
                        Entrar
                        <FaArrowRight className="btn-login-icon" />
                    </button>

                    {errorMsg && (
                        <p className="login-error" role="alert">
                            {errorMsg}
                        </p>
                    )}


                    <div className="division-div">
                        <div className="line"></div>
                        <FaStar className="line-icon" />
                        <div className="line"></div>
                    </div>

                    <div className="or">
                        <h3>ou continue com</h3>
                    </div>

                    <div className="others-box">
                        <div className="other-icon-box">
                            <FaGoogle className="other-icon" />
                        </div>
                        <div className="other-icon-box">
                            <FaDiscord className="other-icon" />
                        </div>
                        <div className="other-icon-box">
                            <FaGithub className="other-icon" />
                        </div>
                    </div>


                    <div className="cadastro-p">
                        <p>Ainda não possui uma conta? <span className="color1">Criar conta</span></p>
                    </div>


                </form>
            </div>
            <div className="fundo">
                <h1>Ametis<span className="color2">ty</span><FaStar className="line-icon" /></h1>

                <div className="fundo-texto-box">
                    <h2>Gerencie, Controle, <span className="color2">sua vida financeira.</span></h2>
                </div>

                <FaStar className="star-1" />
                <FaStar className="star-2" />
                <FaStar className="star-3" />
                <FaStar className="star-4" />
                <FaStar className="star-5" />
                <FaStar className="star-6" />
                <FaStar className="star-7" />
                <FaStar className="star-8" />
                <FaStar className="star-9" />
                <FaStar className="star-10" />


            </div>
        </main>





    );
}


export default Login;
