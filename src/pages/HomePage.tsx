import React from "react"

import { useAuth } from "../hooks/useAuth";

function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1>Добро пожаловать, {user?.name || "Пользователь"}!</h1>
      <p>Роль: {user?.role || "не указана"}</p>
      <button onClick={logout}>Выйти</button>
    </div>
  )
}

export default HomePage