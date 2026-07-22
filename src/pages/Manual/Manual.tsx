import { dashboardRoute } from "@/App";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ManualContent from './manual.mdx';
import manualRaw from "./manual.mdx?raw";
import { getHeadings } from "@/utils/utils";
import { useRef, useState } from "react";

const Manual = () => {
  const [selected, setSelected] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const titles = getHeadings(manualRaw)
  const navigate = useNavigate();

  const scrollToHeading = (index: number) => {
    const container = contentRef.current;
    const heading = container?.querySelectorAll<HTMLElement>('h1')[index];

    if (!container || !heading) return;

    const top =
      heading.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;

    container.scrollTo({ top, behavior: 'smooth' });
    setSelected(index);
  };

  return (
    <main className="flex flex-col bg-dark-background max-h-full h-full w-full">
      <div className="flex flex-row w-full gap-2 items-center justify-start h-[60px] px-[100px] border-b border-zinc-800 py-4">
        <motion.button
          className="text-white h-fit cursor-pointer px-3"
          onClick={() => navigate(dashboardRoute)}
          whileHover={{ x:-3 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <button className="flex items-center gap-[10px] justify-center h-fit cursor-pointer" onClick={() => navigate(dashboardRoute)}>
          <img src="/logo.svg" alt="Logo" className="w-[40px]" />
          <h1 className="text-white font-bold text-[22px]">Nexus</h1>
        </button>
      </div>

      <div className="flex px-[100px] flex-1 min-h-0">
        <div className="flex flex-col border-r border-zinc-800 py-[20px] overflow-y-auto">
          {titles.map((x, index) => {
            return <button key={index} className={`shrink-0 cursor-pointer text-start w-[270px] h-[40px] px-5 border-l-3 border-transparent  ${index === selected ? 'bg-zinc-800 text-white border-l-brand' : 'text-zinc-500 hover:bg-zinc-900/70'}`} onClick={() => scrollToHeading(index)}>{x.text}</button>
          })}
        </div>
        <div ref={contentRef} className="markdown-content text-white flex-1 h-full p-[50px] pt-[20px] overflow-y-auto">
          <ManualContent />
        </div>
      </div>

    </main>
  );
};

export default Manual;
