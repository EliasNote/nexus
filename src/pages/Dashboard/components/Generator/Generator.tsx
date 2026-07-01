import { Binary, Copy, User } from "lucide-react";
import { Input } from "../Credential/components/Input";
import generator from "generate-password-ts";
import { useMemo, useState } from "react";
import { RangeSlider } from "./Components/RangeSlider";

export const Generator = () => {
  const [passlength, setPasslength] = useState(10);
  const minLength = 4;
  const maxLength = 128;

  const password = useMemo(() => {
    try {
      return generator.generate({
        length: passlength,
        numbers: true,
        symbols: true,
        uppercase: true,
        lowercase: true,
        strict: true,
        excludeSimilarCharacters: true,
      });
    } catch (e) {
      console.log(e);
      return;
    }
  }, [passlength]);

  return (
    <section className="flex items-center flex-col h-screen w-full p-10">
      <div className="flex items-center justify-center">
        <Binary size={32} className="text-brand" />
        <h2 className="text-[24px] text-white font-bold">GERADOR DE SENHAS</h2>
      </div>
      <div className="max-w-[700px] w-full">
        <Input
          placeholder=""
          iconTop={User}
          topName=""
          iconsInput={[
            {
              id: "copy",
              icon: Copy,
            },
          ]}
          value={password}
        />
      </div>
      <input
        className="text-white text-center w-12 h-10 focus-within:border-zinc-600 bg-zinc-900 border border-zinc-800 outline-none"
        type="text"
        pattern="[0-9]*"
        min={minLength}
        max={maxLength}
        value={passlength}
        onChange={(e) => {
          const val = e.target.value;

          if (val === "") {
            setPasslength(0);
            return;
          }

          const number = Number(val);

          if (!isNaN(number)) {
            if (number > maxLength) {
              setPasslength(maxLength);
              return;
            }
            if (number >= 0) setPasslength(number);
          }
        }}
      />

      <RangeSlider
        value={passlength}
        onChange={setPasslength}
        minLength={minLength}
        maxLength={maxLength}
      />
    </section>
  );
};

// {
//   credential,
//   setSelectedSideCredential,
//   tempVault,
//   setTempVault,
//   isEdit,
//   setIsEdit,
//   isCreate,
//   setIsCreate,
//   isLoadingCredential,
//   handleStartCreate,
// }: {
//   credential: CredentialType;
//   setSelectedSideCredential: (id: string | null) => void;
//   tempVault: CredentialType;
//   setTempVault: React.Dispatch<React.SetStateAction<CredentialType | null>>;
//   isEdit: boolean;
//   setIsEdit: (isEdit: boolean) => void;
//   isCreate: CredentialType["type"] | null;
//   setIsCreate: (isCreate: CredentialType["type"] | null) => void;
//   isLoadingCredential: boolean;
//   handleStartCreate: (type: CredentialType["type"]) => void;
// }
