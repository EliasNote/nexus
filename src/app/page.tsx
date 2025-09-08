"use client";

import DecryptedText from "@/components/DecryptedText";
import LetterGlitch from "@/components/LetterGlitch";
import TextType from "@/components/TextType";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
	const [hovBtn1, setHovBtn1] = useState(false);
	const [hovBtn2, setHovBtn2] = useState(false);

	return (
		<section className="relative w-screen h-screen overflow-hidden bg-black/70">
			{/* Background */}
			<div className="absolute inset-0 -z-10">
				<LetterGlitch
					glitchSpeed={100}
					centerVignette={false}
					outerVignette={false}
					smooth={false}
				/>
			</div>

			{/* Top Logo */}
			<div className="absolute mt-5 ml-10 text-white flex flex-row items-center gap-3 text-[24px]">
				<Image src="/logo.svg" alt="Logo" width={50} height={50} />
				<nav>Nexus</nav>
			</div>

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-20">
				<Image src="/logo.svg" alt="Logo" width={90} height={90} />
				<div className="text-[40px] font-bold">
					<TextType
						text={["Nexus", "Autonomia", "Segurança", "Suas senhas"]}
						typingSpeed={75}
						pauseDuration={1500}
						showCursor={true}
						cursorCharacter="|"
						cursorClassName="text-white"
					/>
				</div>
				<div className="flex gap-10">
					<button
						onMouseEnter={() => setHovBtn1(true)}
						onMouseLeave={() => setHovBtn1(false)}
						className="cursor-pointer px-[24px] text-[14px] py-[8px] rounded-[3px] bg-white text-black hover:bg-button1 font-[500]"
					>
						<DecryptedText
							speed={50}
							maxIterations={20}
							sequential={false}
							active={hovBtn1}
							text="Começar"
						/>
					</button>
					<button
						onMouseEnter={() => setHovBtn2(true)}
						onMouseLeave={() => setHovBtn2(false)}
						className="cursor-pointer px-[24px] text-[14px] py-[8px] rounded-[3px] bg-button2 text-white hover:bg-button3"
					>
						<DecryptedText
							speed={50}
							maxIterations={20}
							sequential={false}
							active={hovBtn2}
							text="Como usar"
						/>
					</button>
				</div>
			</div>
		</section>
	);
}
