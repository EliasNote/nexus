import { MONTH_OPTIONS } from "@/utils/constants";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const Date = ({
  iconTop: Icontop,
  topName,
  disabled,
  value,
  onChange,
  onDoubleClick,
}: {
  iconTop: LucideIcon;
  topName: string;
  disabled?: boolean;
  value?: string;
  onChange?: (val: string) => void;
  onDoubleClick?: () => void;
}) => {
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const monthButtonRef = useRef<HTMLButtonElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);

  const [monthVal, yearVal] =
    value && value.includes("/") ? value.split("/") : ["", ""];

  const handleEditTarget = (target: "month" | "year") => {
    if (target === "month") setIsMonthOpen(true);
    onDoubleClick?.();

    requestAnimationFrame(() => {
      if (target === "month") {
        monthButtonRef.current?.focus();
      } else {
        yearInputRef.current?.focus();
        yearInputRef.current?.select();
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMonthOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMonth = (monthOption: string) => {
    const monthCode = monthOption.split(" - ")[0];
    const targetYear = yearVal || "";
    onChange?.(`${monthCode}/${targetYear}`);
    setIsMonthOpen(false);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    const targetMonth = monthVal || "01";
    onChange?.(`${targetMonth}/${rawVal}`);
  };

  const getMonthDisplay = () => {
    if (!monthVal) return "Mês";
    const matched = MONTH_OPTIONS.find((m) => m.startsWith(monthVal));
    return matched || monthVal;
  };

  return (
    <div className="flex w-full items-center justify-center outline-none">
      <div className="flex gap-0.5 flex-col w-full max-w-[760px]">
        <div className="flex items-start font-medium gap-1 text-[12px] text-muted">
          <Icontop size={16} strokeWidth={1.5} />
          <span>{topName}</span>
        </div>

        <div className="flex gap-4 w-full">
          <div
            className="relative flex-1"
            ref={monthDropdownRef}
            onDoubleClick={() => handleEditTarget("month")}
          >
            <button
              ref={monthButtonRef}
              type="button"
              disabled={disabled}
              onClick={() => setIsMonthOpen(!isMonthOpen)}
              className={`flex items-center justify-between bg-surface border ${
                isMonthOpen ? "border-line-focus" : "border-line"
              } h-[45px] w-full px-3 ${disabled ? "pointer-events-none" : "cursor-pointer"} transition-colors`}
            >
              <span
                className={
                  monthVal ? "text-primary text-sm" : "text-muted text-sm"
                }
              >
                {getMonthDisplay()}
              </span>
              <ChevronDown
                size={18}
                className={`text-muted transition-transform ${isMonthOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isMonthOpen && (
              <div className="absolute top-[50px] left-0 w-full bg-surface border border-line-strong z-50 shadow-2xl max-h-[200px] overflow-y-auto no-scrollbar">
                {MONTH_OPTIONS.map((month) => (
                  <div
                    key={month}
                    onClick={() => handleSelectMonth(month)}
                    className="flex items-center justify-between px-4 py-2 hover:bg-surface-raised cursor-pointer text-sm text-secondary transition-colors"
                  >
                    <span>{month}</span>
                    {monthVal === month.split(" - ")[0] && (
                      <Check size={16} className="text-brand" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="flex-1"
            onDoubleClick={() => handleEditTarget("year")}
          >
            <div className="group flex items-center focus-within:border-line-focus bg-surface border border-line h-[45px] w-full">
              <input
                ref={yearInputRef}
                disabled={disabled}
                className={`flex-1 bg-transparent px-3 text-[14px] text-primary outline-none placeholder:text-muted ${disabled ? "pointer-events-none" : ""}`}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={4}
                placeholder="Ano (YYYY)"
                value={yearVal}
                onChange={handleYearChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
