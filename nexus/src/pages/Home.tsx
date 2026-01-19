import { useNavigate } from "react-router-dom";
import LetterGlitch from "../component/LetterGlitch";

export default function Home() {
	const navigate = useNavigate();
	return (
		<section className="w-screen h-screen overflow-hidden">
			<LetterGlitch />
			<div className="absolute inset-0 flex items-center justify-center z-10">
				<button
					onClick={() => navigate("/senha")}
					className="px-6 py-3 bg-white text-black rounded shadow-lg text-lg font-bold cursor-pointer"
				>
					Começar
				</button>
			</div>
		</section>
	);
}
