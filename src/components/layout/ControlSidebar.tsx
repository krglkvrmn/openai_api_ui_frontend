import { funcClosureOrUndefined } from "../../utils/functional"

export default function ControlSidebar({ children }: { children: React.ReactNode} ) {
    return (
        <div id="control-sidebar">
            {children}
        </div>
    )

}