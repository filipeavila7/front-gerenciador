import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../components/utils/GetErrorMessage";
import type { UpdateUserRequest } from "../types/user/UpdateUserRequest";

import {
  FaCamera,
  FaUser,
  FaEnvelope,
  FaLock,
  FaTrash,
  FaTimes,
  FaSignOutAlt
} from "react-icons/fa";

import "../styles/me.css";
import "../styles/purchaseModals.css";


function Me() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();


  // ===== dados do perfil =====
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.profileImg ?? null
  );

  const [savingProfile, setSavingProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);



  // ===== troca de senha =====
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingPassword, setSavingPassword] = useState(false);



  // ===== excluir conta =====
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [deleting, setDeleting] = useState(false);



  const [loggingOut, setLoggingOut] = useState(false);



  function handleImageSelect(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = e.target.files?.[0];

    if (!file) return;


    setImageFile(file);

    setImagePreview(
      URL.createObjectURL(file)
    );

  }



  // ===== salvar perfil =====
  async function handleSaveProfile(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setSavingProfile(true);


    try {

      const payload: UpdateUserRequest = {};


      if (
        name.trim() &&
        name !== user?.name
      ) {

        payload.name = name.trim();

      }


      if (
        email.trim() &&
        email !== user?.email
      ) {

        payload.email = email.trim();

      }



      if (imageFile) {

        const formData = new FormData();

        formData.append(
          "image",
          imageFile
        );


        const uploadRes = await api.post<string>(
          "/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );


        payload.profileImg = uploadRes.data;

      }



      if (
        Object.keys(payload).length === 0
      ) {

        showToast(
          "info",
          "Nenhuma alteração para salvar."
        );

        return;

      }



      await api.put(
        "/users/update",
        payload
      );


      showToast(
        "success",
        "Perfil atualizado com sucesso!"
      );


      setImageFile(null);


    } catch (err) {

      showToast(
        "error",
        getErrorMessage(err)
      );


    } finally {

      setSavingProfile(false);

    }

  }




  // ===== logout =====
  async function handleLogout() {

    setLoggingOut(true);


    try {

      await logout();


      showToast(
        "success",
        "Logout realizado com sucesso."
      );


      navigate(
        "/",
        {
          replace: true
        }
      );


    } catch (error) {

      showToast(
        "error",
        getErrorMessage(error)
      );


      navigate(
        "/",
        {
          replace: true
        }
      );


    } finally {

      setLoggingOut(false);

    }

  }



  // ===== trocar senha =====

  const passwordsMatch =
    newPassword.length > 0 &&
    newPassword === confirmPassword;


  const passwordTooShort =
    newPassword.length > 0 &&
    newPassword.length < 6;



  async function handleChangePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();



    if (!currentPassword) {

      showToast(
        "error",
        "Informe sua senha atual."
      );

      return;

    }



    if (!passwordsMatch) {

      showToast(
        "error",
        "As senhas não coincidem."
      );

      return;

    }



    if (passwordTooShort) {

      showToast(
        "error",
        "A senha deve ter pelo menos 6 caracteres."
      );

      return;

    }



    setSavingPassword(true);



    try {


      const payload: UpdateUserRequest = {

        password: currentPassword,

        newPassword

      };



      await api.put(
        "/users/update",
        payload
      );



      showToast(
        "success",
        "Senha alterada com sucesso!"
      );



      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");



    } catch (err) {


      showToast(
        "error",
        getErrorMessage(err)
      );


    } finally {


      setSavingPassword(false);


    }

  }




  // ===== excluir conta =====

  const canDelete =
    deleteConfirmText === "EXCLUIR";



  async function handleDeleteAccount() {


    if (!canDelete) return;


    setDeleting(true);



    try {


      await api.delete(
        "/users/delete"
      );


      showToast(
        "success",
        "Conta excluída."
      );



      await logout();



    } catch (err) {


      showToast(
        "error",
        getErrorMessage(err)
      );


    } finally {


      setDeleting(false);


    }

  } return (

    <div className="me-lay">


      {/* ===== modal excluir conta ===== */}

      {isDeleteModalOpen && (

        <div
          className="modal-overlay"
          onClick={() => setIsDeleteModalOpen(false)}
        >

          <div
            className="modal-box modal-box-small"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <h2>
                Excluir conta
              </h2>


              <button
                className="modal-close-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >

                <FaTimes />

              </button>

            </div>



            <p className="me-delete-warning">

              Essa ação é <strong>permanente</strong>.
              Todos os seus dados serão perdidos e você será removido
              de todas as famílias das quais participa.

              Digite{" "}
              <strong>EXCLUIR</strong>
              {" "}para confirmar.

            </p>



            <input

              type="text"

              className="me-delete-input"

              value={deleteConfirmText}

              onChange={(e) =>
                setDeleteConfirmText(e.target.value)
              }

              placeholder="Digite EXCLUIR"

            />



            <div className="modal-footer">


              <button

                className="modal-cancel-btn"

                onClick={() =>
                  setIsDeleteModalOpen(false)
                }

              >

                Cancelar

              </button>



              <button

                className="modal-confirm-btn modal-confirm-btn-danger"

                onClick={handleDeleteAccount}

                disabled={!canDelete || deleting}

              >

                {
                  deleting
                    ? "Excluindo..."
                    : "Excluir minha conta"
                }


              </button>


            </div>


          </div>


        </div>

      )}





      <div className="me-container">



        <div className="me-header">

          <h1>
            Minha conta
          </h1>


          <p>
            Gerencie suas informações pessoais e preferências.
          </p>


        </div>





        {/* ===== informações pessoais ===== */}


        <div className="me-card">


          <h3 className="me-card-title">

            <FaUser />

            Informações pessoais

          </h3>



          <form
            className="me-form"
            onSubmit={handleSaveProfile}
          >



            <label className="me-image-upload">


              {
                imagePreview ? (

                  <img

                    src={imagePreview}

                    alt="Foto de perfil"

                    className="me-image-preview"

                  />

                ) : (

                  <div className="me-image-placeholder">


                    {
                      user?.profileImg ? (

                        <img

                          src={user.profileImg}

                          alt="Foto de perfil"

                          className="me-image-preview"

                        />

                      ) : (

                        <FaUser />

                      )
                    }


                  </div>

                )

              }



              <div className="me-image-overlay">

                <FaCamera />

              </div>




              <input

                ref={fileInputRef}

                type="file"

                accept="image/*"

                onChange={handleImageSelect}

                hidden

              />



            </label>





            <div className="me-field">


              <label>
                Nome
              </label>


              <input

                type="text"

                value={name}

                onChange={(e) =>
                  setName(e.target.value)
                }

                placeholder="Seu nome"

                minLength={3}

                maxLength={25}

              />


            </div>





            <div className="me-field">


              <label>
                E-mail
              </label>



              <div className="me-input-with-icon">


                <FaEnvelope className="me-input-icon" />



                <input

                  type="email"

                  value={email}

                  onChange={(e) =>
                    setEmail(e.target.value)
                  }

                  placeholder="seu@email.com"

                />


              </div>


            </div>





            <button

              className="me-save-btn"

              type="submit"

              disabled={savingProfile}

            >

              {
                savingProfile
                  ? "Salvando..."
                  : "Salvar alterações"
              }


            </button>




          </form>



        </div>







        {/* ===== alterar senha ===== */}


        <div className="me-card">


          <h3 className="me-card-title">

            <FaLock />

            Alterar senha

          </h3>





          <form

            className="me-form"

            onSubmit={handleChangePassword}

          >




            <div className="me-field">


              <label>
                Senha atual
              </label>



              <input

                type="password"

                value={currentPassword}

                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }

                placeholder="Digite sua senha atual"

              />


            </div>






            <div className="me-field">


              <label>
                Nova senha
              </label>



              <input

                type="password"

                value={newPassword}

                onChange={(e) =>
                  setNewPassword(e.target.value)
                }

                placeholder="Mínimo 6 caracteres"

              />


            </div>







            <div className="me-field">


              <label>
                Confirmar nova senha
              </label>



              <input

                type="password"

                value={confirmPassword}

                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }

                placeholder="Repita a nova senha"

              />




              {
                confirmPassword.length > 0 &&
                !passwordsMatch && (

                  <span className="me-field-error">

                    As senhas não coincidem

                  </span>

                )
              }



            </div>







            <button


              className="me-save-btn"


              type="submit"


              disabled={

                savingPassword ||

                !currentPassword ||

                !passwordsMatch ||

                passwordTooShort

              }



            >


              {
                savingPassword
                  ? "Alterando..."
                  : "Alterar senha"
              }



            </button>





          </form>



        </div>









        {/* ===== zona de perigo ===== */}



        <div className="me-danger-zone">


          <div className="me-danger-info">


            <h3>
              Excluir conta
            </h3>


            <p>
              Essa ação é permanente e não pode ser desfeita.
            </p>


          </div>





          <button

            className="me-delete-btn"

            onClick={() =>
              setIsDeleteModalOpen(true)
            }

          >


            <FaTrash />

            Excluir conta


          </button>




        </div>







        <button

          className="me-logout-btn"

          onClick={handleLogout}

          disabled={loggingOut}

        >

          <FaSignOutAlt />

          {
            loggingOut
              ? "Saindo..."
              : "Sair da conta"
          }


        </button>





      </div>



    </div>

  );

}


export default Me;