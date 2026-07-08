import { useState, useEffect } from "react"
import type { FamilyResponse } from "../types/family/FamilyResponse"
import api from "../service/api";
import "../styles/familieSelection.css";
import { useNavigate } from "react-router-dom";
import type { UserResponse } from "../types/user/UserResponse";
import { getErrorMessage } from "../components/utils/getErrorMessage";

const VISIBLE_CARDS = 4;

// Ícones alternando por índice — troque pela lógica real (ex: f.icon) se o backend fornecer
const ICONS = [
  // pessoas
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" fill="currentColor"/>
    <path d="M16 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor" opacity="0.7"/>
    <path d="M2.5 19c.5-3.2 3-5 6.5-5s6 1.8 6.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M14.5 14.3c2.6.4 4.3 1.9 4.8 4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
  </svg>,
  // casa
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 11.5 12 4l8.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 10v9.5h12V10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M10 19.5v-6h4v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>,
  // coração
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20.3s-7.5-4.6-9.8-9.3C.6 7.6 2.3 4 5.9 4c2 0 3.5 1 6.1 3.2C14.6 5 16.1 4 18.1 4c3.6 0 5.3 3.6 3.7 7-2.3 4.7-9.8 9.3-9.8 9.3Z" fill="currentColor"/>
  </svg>,
  // estrela
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.7L12 2.5Z" fill="currentColor"/>
  </svg>,
];

export default function FamilySelection() {
  const navigate = useNavigate()
  const [families, setFamilies] = useState<FamilyResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  
  async function loadFamilies() {
    const res = await api.get<FamilyResponse[]>("/families/my")
    setFamilies(res.data)
    if (res.data.length > 0) {
      setSelectedId(res.data[0].id); // seleciona a primeira por padrão
    }
  }

  
    async function getMe() {
  
      try{
          const res = await api.get<UserResponse>("users/me")
          setUser(res.data);
      }
      catch(erro){
          console.log(getErrorMessage(erro))
      }
      
    }
  
  

  useEffect(() => {
    loadFamilies()
    getMe();
  }, [])

  const hasCarousel = families.length > VISIBLE_CARDS;
  const maxIndex = Math.max(families.length - VISIBLE_CARDS, 0);

  function handlePrev() {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }

  function handleNext() {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  }

  function handleSelect(id: number | string) {
    setSelectedId(id);
    
    

    
  }

  function selectFamily(id: number | string) {
    setSelectedId(id);
    
    navigate(`/family/${id}/dashboard`);

    
  }

  

  return (
    <div className="family-lay">

      {/* estrelas decorativas */}
      <span className="deco-star star-1">★</span>
      <span className="deco-star star-2">★</span>
      <span className="deco-star star-3">★</span>
      <span className="deco-star star-4">★</span>
      <span className="deco-star star-5">★</span>
      <span className="deco-star star-6">★</span>

      <div className="family-header">
        <div className="family-title">
          <h2>Olá {user?.name}, Selecione sua <span className="highlight">Família</span></h2>
          <p>Escolha a família que deseja acessar para gerenciar seus gastos.</p>
        </div>
        <button className="create-family-btn">
          <span className="plus-icon">+</span> Criar nova família
        </button>
      </div>

      <div className="family-carousel-wrapper">
        {hasCarousel && (
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ‹
          </button>
        )}

        <div className="family-carousel-track">
          <div
            className="family-box"
            style={
              hasCarousel
                ? { transform: `translateX(-${currentIndex * (100 / VISIBLE_CARDS)}%)` }
                : undefined
            }
          >
            {families.map((f, i) => {
              const isSelected = f.id === selectedId;
              return (
                <div
                  onClick={() => handleSelect(f.id)}
                  className={`family-card ${isSelected ? "family-card-selected" : ""}`}
                  key={f.id}
                >
                  {isSelected && (
                    <div className="check-badge">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12.5l5 5L20 6.5" stroke="#181833" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}

                  <div className={`family-icon-box ${isSelected ? "icon-selected" : ""}`}>
                    {ICONS[i % ICONS.length]}
                  </div>

                  <h2>{f.name}</h2>
                  <p className="family-members">
                    <svg className="members-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor"/>
                      <path d="M2.5 17.5c.4-2.7 2.5-4.2 5.5-4.2s5.1 1.5 5.5 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M13.5 7.2a2.3 2.3 0 1 1 0 4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M15.5 13.5c2 .4 3.3 1.6 3.7 3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {f.totalMembers} membros
                  </p>

                  <button
                    className={`select-btn ${isSelected ? "select-btn-active" : ""}`}
                    onClick={() => selectFamily(f.id)}
                  >
                    Selecionar
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {hasCarousel && (
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
          >
            ›
          </button>
        )}
      </div>

      <div className="privacy-note">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="10.5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6"/>
        </svg>
        <div>
          <p>Suas informações são privadas e seguras.</p>
          <p>Somente membros da família têm acesso aos dados.</p>
        </div>
      </div>

    </div>
  )
}