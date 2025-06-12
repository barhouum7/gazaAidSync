import MainGrid from "@/components/layout/main-grid";
import UpdatesAndActions from "@/components/layout/updates-and-actions";
import MapContainer from "@/components/map/map-container";
// import MapSidebar from "@/components/map/map-sidebar";


export default function Home() {
    return (
        <MainGrid
            // left={<MapSidebar />}
            center={<MapContainer />}
            right={<UpdatesAndActions />}
        />
    );
}