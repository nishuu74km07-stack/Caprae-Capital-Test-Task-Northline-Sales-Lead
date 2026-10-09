import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";

export function OptionChips({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2.5 font-bold">{label}</p>
      <ButtonGroup>
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <Button
              key={option}
              size="sm"
              variant={active ? "primary" : "secondary"}
              pressed={active}
              onClick={() => onToggle(option)}
            >
              {option}
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  );
}
