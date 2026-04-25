import LetterGlitch from "./components/LetterGlitch"

function App() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <LetterGlitch
        glitchSpeed={50}
        centerVignette={true}
        outerVignette={false}
        smooth={true}
        classname="fixed inset-0 z-0 pointer-events-none"
      />
      <main className="relative z-10 flex min-h-screen items-center justify-center">
        <h1 className="text-4xl font-bold text-blue-500">
          Olá React + Tailwind v4!
        </h1>
      </main>
    </div>
  )
}

export default App