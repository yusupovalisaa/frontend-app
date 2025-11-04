import React, { useState, useRef } from "react";
import styles from "./AuthTabs.module.css";
import { useNavigate } from "react-router-dom";
import { CONFIG } from "../utils/constants";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/authApi";

export const AuthTabs = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { login, verify } = useAuth();

  // ======== Вход ========
  const [loginUsername, setLoginUsername] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginPhase, setLoginPhase] = useState<"username" | "code">("username");
  const loginInputsRef = useRef<HTMLInputElement[]>([]);

  // ======== Регистрация ========
  const [regRole, setRegRole] = useState("student");
  const [regSurname, setRegSurname] = useState("");
  const [regName, setRegName] = useState("");
  const [regPatronymic, setRegPatronymic] = useState("");
  const [regPhase, setRegPhase] = useState<"form" | "telegram">("form");
  const [regToken, setRegToken] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  // === Обработчик входа (отправка username) ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const normalizedUsername = loginUsername.startsWith("@")
      ? loginUsername.slice(1)
      : loginUsername;

    try {
      await login(normalizedUsername);
      setLoginPhase("code");
      setMessage("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Ошибка при входе");
      }
    }
  };

  // === Проверка кода из Telegram ===
  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const normalizedUsername = loginUsername.startsWith("@")
      ? loginUsername.slice(1)
      : loginUsername;

    try {
      await verify(normalizedUsername, loginCode);
      setMessage("Вход успешен! Перенаправляем...");
      setTimeout(() => navigate("/"), 1000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Неверный код из Telegram");
      }
    }
  };

  // === Изменение цифры в OTP ===
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, "");
    const newCode = loginCode.split("");
    newCode[idx] = val;
    setLoginCode(newCode.join("").slice(0, 6));

    if (val && idx < 5) loginInputsRef.current[idx + 1]?.focus();
  };

  // === Удаление цифры в OTP (Backspace) ===
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newCode = loginCode.split("");
      if (newCode[idx]) {
        newCode[idx] = "";
        setLoginCode(newCode.join(""));
      } else if (idx > 0) {
        loginInputsRef.current[idx - 1]?.focus();
      }
    }
  };

  // === Регистрация пользователя ===
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = await authApi.register({
        role: regRole,
        surname: regSurname,
        name: regName,
        patronymic: regPatronymic,
      });

      if (data?.token) {
        setRegToken(data.token);
        setRegPhase("telegram");
        setIsLocked(true);
        setMessage("");
      } else {
        setMessage("Ошибка регистрации: отсутствует токен");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Ошибка регистрации");
      }
    }
  };

  // === Перейти в Telegram ===
  const handleGoToTelegram = () => {
    if (regToken) {
      const telegramUrl = `${CONFIG.TELEGRAM_BOT_LINK}?start=${regToken}`;
      window.open(telegramUrl, "_blank", "noopener,noreferrer");
    } else {
      setMessage("Ошибка: токен не найден");
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === "login" ? styles.tabActive : styles.tabInactive}`}
            onClick={() => {
              setActiveTab("login");
              setMessage("");
              setLoginPhase("username");
              setLoginUsername("");
              setLoginCode("");
            }}
          >
            Вход
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "register" ? styles.tabActive : styles.tabInactive}`}
            onClick={() => {
              setActiveTab("register");
              setMessage("");
              setRegPhase("form");
              setIsLocked(false);
              setRegToken("");
            }}
          >
            Регистрация
          </button>
        </div>

        {activeTab === "login" && (
          <form
            onSubmit={loginPhase === "username" ? handleLogin : handleVerifyLogin}
            className={styles.formContainer}
          >
            <input
              placeholder="Username из Telegram"
              value={loginUsername}
              onChange={e => setLoginUsername(e.target.value)}
              required
              className={styles.inputField}
              disabled={loginPhase === "code"}
            />

            {loginPhase === "username" && (
              <button
                type="submit"
                className={styles.authButton}
                disabled={!loginUsername.trim()}
              >
                Получить код
              </button>
            )}

            {loginPhase === "code" && (
              <>
                <p className={styles.telegramMessage}>Введите код из Telegram:</p>
                <div className={styles.otpContainer}>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <input
                      key={idx}
                      ref={el => (loginInputsRef.current[idx] = el!)}
                      type="text"
                      maxLength={1}
                      value={loginCode[idx] || ""}
                      onChange={e => handleOtpChange(e, idx)}
                      onKeyDown={e => handleOtpKeyDown(e, idx)}
                      className={styles.otpInput}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className={styles.authButton}
                  disabled={loginCode.length !== 6}
                >
                  Войти
                </button>
              </>
            )}
          </form>
        )}

        {activeTab === "register" && (
          <form onSubmit={handleRegister} className={styles.formContainer}>
            <select
              value={regRole}
              onChange={e => setRegRole(e.target.value)}
              className={styles.selectField}
              disabled={isLocked}
            >
              <option value="student">Студент</option>
              <option value="tutor">Репетитор</option>
            </select>

            <input
              placeholder="Фамилия*"
              value={regSurname}
              onChange={e => setRegSurname(e.target.value)}
              required
              className={styles.inputField}
              disabled={isLocked}
            />
            <input
              placeholder="Имя*"
              value={regName}
              onChange={e => setRegName(e.target.value)}
              required
              className={styles.inputField}
              disabled={isLocked}
            />
            <input
              placeholder="Отчество"
              value={regPatronymic}
              onChange={e => setRegPatronymic(e.target.value)}
              className={styles.inputField}
              disabled={isLocked}
            />

            {!isLocked && (
              <button
                type="submit"
                className={styles.authButton}
                disabled={!regSurname.trim() || !regName.trim()}
              >
                Зарегистрироваться
              </button>
            )}

            {regPhase === "telegram" && (
              <div>
                <p className={styles.telegramMessage}>
                  Для завершения регистрации перейдите в Telegram:
                </p>
                <button
                  type="button"
                  className={styles.authButton}
                  onClick={handleGoToTelegram}
                >
                  Перейти в Telegram
                </button>
                <p className={styles.helpText}>
                  Если кнопка не работает, скопируйте эту ссылку: <br />
                  <code>{CONFIG.TELEGRAM_BOT_LINK}?start={regToken}</code>
                </p>
              </div>
            )}
          </form>
        )}

        {message && (
          <p className={`${styles.message} ${message.includes("успеш") ? styles.success : styles.error}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};