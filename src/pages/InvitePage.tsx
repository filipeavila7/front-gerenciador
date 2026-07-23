import { useNavigate, useParams } from "react-router-dom";
import type { FamilyInviteDetailsResponse } from "../types/invite/FamilyInviteDetailsResponse";
import { getErrorMessage } from "../components/utils/GetErrorMessage";
import { useToast } from "../context/ToastContext";
import { useEffect, useState } from "react";
import api from "../service/api";
import type { IconType } from "react-icons";
import type { InviteStatus } from "../types/invite/InviteStatus";

import { FaClock, FaHourglassEnd, FaStar, FaUser } from "react-icons/fa";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";

import "../styles/invite.css";
import axios from "axios";


function InvitePage() {
  const { token } = useParams();
  const { showToast } = useToast();

  const navigate = useNavigate();

  const [invite, setInvite] = useState<FamilyInviteDetailsResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [loadingBtn, setLoadingBtn] = useState<
    "ACCEPT" | "CANCEL" | null
  >(null);



  const inviteStatusConfig: Record<
    InviteStatus,
    {
      label: string;
      icon: IconType;
      color: string;
    }
  > = {
    PENDING: {
      label: "Pendente",
      icon: FaClock,
      color: "#f59e0b",
    },

    ACCEPTED: {
      label: "Aceito",
      icon: FaCircleCheck,
      color: "#22c55e",
    },

    CANCELLED: {
      label: "Cancelado",
      icon: FaCircleXmark,
      color: "#ef4444",
    },

    EXPIRED: {
      label: "Expirado",
      icon: FaHourglassEnd,
      color: "#6b7280",
    },
  };



  async function getTokenInvite() {
    try {
      setLoading(true);

      const res = await api.get<FamilyInviteDetailsResponse>(
        `/invite/token/${token}`
      );

      setInvite(res.data);
      sessionStorage.removeItem("pendingInvite");

    } catch (err) {
      showToast("error", getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }


  async function handleAccept() {
    try {
      setLoadingBtn("ACCEPT");

      await api.post<void>(
        `/invite/token/${token}/accept`
      );

      showToast("success", "Convite aceito com sucesso!");

      getTokenInvite();

      navigate(`/family/${invite?.familyId}/dashboard`)

    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        sessionStorage.setItem("pendingInvite", token ?? "");

        navigate("/");
        return;
      }
      showToast("error", getErrorMessage(err));

    } finally {
      setLoadingBtn(null);
    }
  }



  async function handleCancel() {
    try {
      setLoadingBtn("CANCEL");

      await api.post<void>(
        `/invite/token/${token}/cancel`
      );

      showToast("success", "Convite recusado!");

      getTokenInvite();

    } catch (err) {
      showToast("error", getErrorMessage(err));

    } finally {
      setLoadingBtn(null);
    }
  }



  useEffect(() => {
    if (token) {
      getTokenInvite();
    }
  }, [token]);



  if (loading) {
    return (
      <div>
        Carregando...
      </div>
    );
  }



  const status = invite
    ? inviteStatusConfig[invite.status]
    : null;

  const Icon = status?.icon;



  return (
    <div className="invite-lay">

      <div className="invite-page">

        <div className="invite-title">
          <h1>
            Convite para entrar na família
          </h1>
        </div>



        <div className="invite-card">

          <div className="invite-img-box">

  {
    invite?.profileImg ? (
      <img
        className="invite-img"
        src={invite.profileImg}
        alt="Foto da família"
      />
    ) : (
      <FaUser className="invite-default-icon" />
    )
  }

</div>


          <h2>
            Família {invite?.familyName}
          </h2>



          <div className="expiration">

            {status && Icon && (
              <p style={{ color: status.color }}>
                <Icon />
                {status.label}
              </p>
            )}


            <p>
              Expira em: {invite?.expiresAt && formatDate(invite.expiresAt)}
            </p>

          </div>

        </div>



        {invite?.status === "PENDING" && (
          <>
            <div className="invite-actions">

              <button
                className="invite-btn"
                onClick={handleAccept}
                disabled={loadingBtn !== null}
              >
                {
                  loadingBtn === "ACCEPT"
                    ? "Aceitando..."
                    : "Aceitar"
                }
              </button>

            </div>



            <div className="invite-actions">

              <button
                className="invite-btn-c"
                onClick={handleCancel}
                disabled={loadingBtn !== null}
              >
                {
                  loadingBtn === "CANCEL"
                    ? "Cancelando..."
                    : "Cancelar"
                }
              </button>

            </div>
          </>
        )}



      </div>



      <div className="invite-footer">

        <p>
          enviado por {invite?.createdByName}
        </p>


        <p className="invite-mark">
          Ametis
          <span className="color2">
            ty
          </span>

          {" "}

          <FaStar className="nav-title-icon" />

        </p>

      </div>


    </div>
  );
}

export default InvitePage;