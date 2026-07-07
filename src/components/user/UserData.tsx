import api from "../../service/api"
import { useState, useEffect } from "react"
import type { UserResponse } from "../../types/user/UserResponse"
import "../../styles/user.css"


function UserData() {
    const [user, setUser] = useState<UserResponse | null>(null);

  async function getMe() {

    try{
        const res = await api.get<UserResponse>("users/me")
        setUser(res.data);
    }
    catch(erro){
        console.log(erro)
    }
    
  }

  useEffect(() => {
    getMe();
  }, []);


  return (
    <div>
      {user ? (
        <h2 className="user-data-title">Olá, <span className="color2">{user.name}</span></h2>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}

export default UserData