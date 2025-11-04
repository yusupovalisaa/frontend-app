import React from "react"
import { Link } from "react-router-dom"

const NotFound = () => (
  <div style={{ textAlign: "center" }}>
    <h2>Страница не найдена</h2>
    <Link to="/">На главную</Link>
  </div>
)

export default NotFound