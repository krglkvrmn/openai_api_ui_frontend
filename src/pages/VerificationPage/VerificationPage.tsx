import {VerificationController} from "../../components/control/VerificationController/VerificationController.tsx";
import {ModalCard} from "../../components/ui/Layout/ModalCard/ModalCard.tsx";


export function VerificationPage() {
    return (
        <ModalCard showBorder>
            <VerificationController />
        </ModalCard>
    );
}