import type { CredentialSummary } from "@/utils/vault";

export const AuditCredential = ({
  credentialSummary,
  onChangeCredential,
  reusedColorClass,
}: {
  credentialSummary: CredentialSummary;
  onChangeCredential: (credentialId: string) => void;
  reusedColorClass?: string;
}) => {
  return (
    <div
      data-reused={Boolean(reusedColorClass)}
      className={`audit-credential-card flex flex-row items-center justify-between border p-[12px] ${reusedColorClass ?? "border-line text-primary"}`}
    >
      <div className="flex gap-2">
        <div className="audit-credential-avatar flex items-center justify-center h-[38px] w-[38px] border border-line-strong bg-surface text-primary">
          {credentialSummary.title?.[0]}
        </div>
        <div className="flex flex-col">
          <span className="text-primary text-[14px]">{credentialSummary.title}</span>
          <span className="text-faint text-[12px]">
            {credentialSummary.username ?? credentialSummary.holderName ?? credentialSummary.name}
          </span>
        </div>
      </div>
      <button
        className="text-primary px-[14px] py-[8px] font-bold border border-line-strong hover:border-line-focus text-[14px] cursor-pointer hover:bg-surface"
        onClick={() => onChangeCredential(credentialSummary.id)}
      >
        ALTERAR
      </button>
    </div>
  );
};
