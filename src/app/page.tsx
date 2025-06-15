import MainGrid from "@/components/layout/main-grid";
import UpdatesAndActions from "@/components/layout/updates-and-actions";
import { MapContainerWrapper } from "@/components/map/map-container-wrapper";
// import MapSidebar from "@/components/map/map-sidebar";

export default function Home() {
    return (
        <MainGrid
            // left={<MapSidebar />}
            center={<MapContainerWrapper />}
            right={<UpdatesAndActions />}
        />
    );
}