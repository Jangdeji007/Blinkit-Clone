import { BrowserRouter, Route, Routes } from 'react-router-dom'

function HomePage() {
  return (
    <main className="home-page">
      <h1>Blinkit Clone — React Ready</h1>
      <p>Frontend setup complete. Phase 1 starts next.</p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}
