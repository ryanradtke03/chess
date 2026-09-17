import type { PieceColor, PieceRole } from "../types";
import Piece from "./Piece";

const PROMOTION_ROLES: PieceRole[] = ["Q", "R", "B", "N"];

interface PromotionDialogProps {
  color: PieceColor;
  onSelect: (role: PieceRole) => void;
  onCancel?: () => void;
}

function PromotionDialog({ color, onSelect, onCancel }: PromotionDialogProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="flex gap-2 rounded-lg bg-neutral-100 p-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {PROMOTION_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => onSelect(role)}
            className="h-16 w-16 rounded-md bg-white transition hover:bg-yellow-200"
          >
            <Piece color={color} role={role} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default PromotionDialog;
