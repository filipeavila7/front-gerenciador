import { useState, useEffect } from "react"
import type { FamilyResponse } from "../types/family/FamilyResponse"
import api from "../service/api";



export default function FamilySelection() {
  const [families, setFamilies] = useState<FamilyResponse[]>([]); // useState é um array de FamilyResponse


  async function loadFamilies(){
    const res = await api.get<FamilyResponse[]>("/families/my") // dizer que a reposta do get é um array de familyResponse

    setFamilies(res.data)
  }


  useEffect(() => {
    
    loadFamilies()
   
  }, [])
  


  return (
    <div>
      {families.map(f =>(
        <div key={f.id} >
          <h2>{f.name}</h2>
           <p>{f.totalMembers} membros</p>
        </div>
      ))}
    </div>
  )
}
