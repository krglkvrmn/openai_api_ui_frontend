import {ModalCard} from "../../components/layout/ModalCard/ModalCard.tsx";
import {VerificationController} from "./VerificationController.tsx";


export function VerificationPage() {
    return (
        <ModalCard showBorder>
            <VerificationController />
        </ModalCard>
    );
}