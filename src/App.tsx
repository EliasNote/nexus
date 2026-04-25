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
        <div className="flex gap-4 items-center justify-center font-normal text-sm">
              <button
                className="px-7 py-2.5 bg-[#2563EB] border font-bold border-[#5C8FFF] text-white shadow-lg cursor-pointer"
              >
                Começar
              </button>
              <button
                className="px-7 py-2.5 bg-zinc-800 border font-bold border-zinc-600 text-white shadow-lg cursor-pointer"
              >
                Como usar
              </button>
            </div>
      </main>
    </div>
  )
}

export default App