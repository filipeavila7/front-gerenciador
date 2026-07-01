import { useState } from "react";
import api from "../service/api";

import type { LoginRequest } from "../types/auth/LoginRequest";
import type { LoginResponse } from "../types/auth/LoginResponse";
import { FaRegUser, FaLock } from "react-icons/fa";
import "../styles/login.css";
import { LuLock } from "react-icons/lu";


function Login() {

    const [form, setForm] = useState<LoginRequest>({
        email: "",
        password: ""
    });


    function handleChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {

        const { name, value } = event.target;


        setForm({
            ...form,
            [name]: value
        });

    }


    async function handleSubmit(
        event: React.SubmitEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        try {

            const response = await api.post<LoginResponse>(
                "/auth/login",
                form
            );


            localStorage.setItem(
                "token",
                response.data.token
            );

            


            console.log("Login realizado");


        } catch (error) {

            console.log("Erro no login");

        }

    }


    return (
        <main className="form-lay">
            <div className="form-box">
                <div className="form-title">
                    <h1>Amethist</h1>
                </div>

            <form className="form" onSubmit={handleSubmit}>

            <label htmlFor="email">Email</label>

            <div className="input-lay">
                <FaRegUser className="login-icon"/>
                <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
            />
            </div>
            

            <label htmlFor="">Senha</label>

            <div className="input-lay">
                <LuLock  className="login-icon"/>
            <input
                type="password"
                name="password"
                placeholder="Senha"
                value={form.password}
                onChange={handleChange}
                
            />
            </div>
           


            <button className="btn-login" type="submit">
                Entrar
            </button>


        </form>
         </div>
        </main>
        

       
       

    );
}


export default Login;