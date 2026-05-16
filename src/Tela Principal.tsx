import { useLocation } from "react-router-dom";

const TelaPrincipal = () => {
  const location = useLocation();
  const texto = location.state?.texto || "";

  return (
    <div>
      <h1 className="text-black">{texto}</h1>
    </div>
  );
};

export default TelaPrincipal;
